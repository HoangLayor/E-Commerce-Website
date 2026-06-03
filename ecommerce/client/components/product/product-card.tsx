"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Star, Sparkles, Crown, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product, formatPrice, getDiscountPercentage, getBadgeLabel } from "@/lib/data";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fetchActiveFlashSalesCached, fetchBestSellersCached, fetchNewProductsCached } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  rank?: number;
}

export function ProductCard({ product, priority = false, rank }: ProductCardProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const discount = getDiscountPercentage(product.price, product.compareAtPrice);

  const { addItem } = useCart();
  const [isFlashSale, setIsFlashSale] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkFlashSale() {
      try {
        const campaigns = await fetchActiveFlashSalesCached();
        const now = new Date();
        const activeCampaigns = campaigns.filter(c => c.isActive && new Date(c.endTime) > now && new Date(c.startTime) <= now);
        
        const isProdInFlashSale = activeCampaigns.some(campaign => 
          campaign.products.some(p => 
            product.variants.some(v => String(v.id) === String(p.variantId))
          )
        );
        
        if (isMounted) {
          setIsFlashSale(isProdInFlashSale);
        }
      } catch (e) {
        // Silent error
      }
    }
    checkFlashSale();
    return () => { isMounted = false; };
  }, [product.variants]);

  const [extraBadges, setExtraBadges] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function checkExtraBadges() {
      try {
        const [bestSellers, newProducts] = await Promise.all([
          fetchBestSellersCached().catch(() => []),
          fetchNewProductsCached().catch(() => []),
        ]);
        
        const badgesToAdd: string[] = [];
        const isBestselling = bestSellers.some(bp => String(bp.id) === String(product.id));
        const isNewArrival = newProducts.some(np => String(np.id) === String(product.id));
        
        if (isBestselling) badgesToAdd.push("bestseller");
        if (isNewArrival) badgesToAdd.push("new");
        
        if (isMounted) {
          setExtraBadges(badgesToAdd);
        }
      } catch (e) {}
    }
    checkExtraBadges();
    return () => { isMounted = false; };
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const firstVariant = product.variants[0];
    if (!firstVariant) {
      toast.error("Sản phẩm chưa có phiên bản nào");
      return;
    }

    try {
      setIsAdding(true);
      // Use the addItem from CartContext to ensure header count updates
      await addItem(Number(firstVariant.id), 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng";
      if (message.includes("403") || message.includes("401") || /token/i.test(message)) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
        router.push("/account/login");
        return;
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="group relative bg-gradient-to-br from-white via-primary-light/20 to-secondary/10 rounded-2xl overflow-hidden border border-primary/10 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(183,110,121,0.15)] transition-all duration-500 hover:-translate-y-1.5">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-primary-light/30 to-secondary/20">
        <Image
          src={product.images[0]?.url || "/placeholder.jpg"}
          alt={product.images[0]?.alt || product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={priority}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isFlashSale && (
            <div className="relative group/flame select-none self-start">
              <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-25" />
              <div className="relative flex items-center gap-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-[0_2px_8px_rgba(249,115,22,0.5)] border border-orange-400/20 animate-pulse">
                <Flame className="h-3 w-3 fill-amber-300 text-amber-300 animate-bounce" />
                <span>HOT 🔥</span>
              </div>
            </div>
          )}
          {Boolean(discount && discount > 0) && (
            <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20 gap-1 font-semibold self-start">
              <Zap className="h-3 w-3" />
              -{discount}%
            </Badge>
          )}
          {Array.from(new Set([...product.badges, ...extraBadges])).filter(b => !(isFlashSale && b === "sale")).map((badge) => (
            <Badge
              key={badge}
              className={
                badge === "bestseller"
                  ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-md shadow-primary/20 gap-1 font-semibold"
                  : badge === "new"
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20 gap-1 font-semibold"
                    : "bg-gradient-to-r from-secondary to-orange-200 text-foreground shadow-md gap-1 font-semibold"
              }
            >
              {badge === "bestseller" && <Crown className="h-3 w-3" />}
              {badge === "new" && <Sparkles className="h-3 w-3" />}
              {badge === "sale" && <Flame className="h-3 w-3" />}
              {getBadgeLabel(badge)}
            </Badge>
          ))}
        </div>

        {/* Rank Badge for Best Sellers */}
        {rank !== undefined && (
          <div className="absolute -top-1 -right-1 p-2 pointer-events-none z-10">
            <div className="relative flex items-center justify-center">
              <div className={cn(
                "absolute inset-0 blur-lg opacity-40 rounded-full",
                rank === 1 ? "bg-amber-400" :
                rank === 2 ? "bg-slate-300" :
                rank === 3 ? "bg-amber-600" :
                "bg-primary/20"
              )} />
              <div className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full border shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-500",
                rank === 1 ? "bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 border-amber-200 text-white" :
                rank === 2 ? "bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 border-slate-100 text-white" :
                rank === 3 ? "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border-amber-500 text-white" :
                "bg-white/90 backdrop-blur-sm border-primary/20 text-primary"
              )}>
                <span className="text-[10px] font-black leading-none select-none tracking-tighter">
                  TOP
                  <br />
                  {rank.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-primary hover:text-white shadow-lg shadow-primary/10 transition-all duration-300"
            aria-label="Thêm vào yêu thích"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to Cart - Desktop on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-primary/40 via-rose-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 hidden sm:block">
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full bg-white/95 backdrop-blur-sm text-primary hover:bg-primary hover:text-white rounded-full shadow-lg transition-all duration-300 font-medium"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
          </Button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(product.rating.average) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">({product.rating.count})</span>
          <span className="text-[10px] text-muted-foreground/60 ml-auto font-medium">Đã bán {product.totalSold}</span>
        </div>

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </span>
          {(product.compareAtPrice || 0) > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Variants indicator */}
        {product.variants.length > 1 && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/50" />
            {product.variants.length} lựa chọn
          </p>
        )}

        {/* Mobile Add to Cart */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full mt-3 sm:hidden rounded-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white shadow-md shadow-primary/20"
          size="sm"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
        </Button>
      </div>
    </article>
  );
}
