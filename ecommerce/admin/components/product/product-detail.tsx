"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Share2,
  Check,
  ThumbsUp,
  BadgeCheck,
  FlaskConical,
  Zap,
  Crown,
  Sparkles,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { ProductCard } from "@/components/product/product-card";
import { useCart } from "@/contexts/cart-context";
import {
  type Product,
  type ProductVariant,
  formatPrice,
  getDiscountPercentage,
  getBadgeLabel,
  categories,
} from "@/lib/data";
import { normalizeImageUrl, fetchActiveFlashSalesCached, fetchBestSellersCached, fetchNewProductsCached } from "@/lib/api";
import { ProductReviews } from "@/components/product/product-reviews";

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  // When variant changes, switch to its image if it has a dedicated one
  const handleVariantSelect = (variant: typeof selectedVariant) => {
    setSelectedVariant(variant);
    if (variant.imageUrl) {
      // find the index of this variant's image in the product images array
      const idx = product.images.findIndex((img) => img.url === variant.imageUrl);
      if (idx >= 0) setSelectedImage(idx);
    }
  };

  /**
   * Group variants by attribute type so we render one row per attribute.
   * e.g. { color: [varA, varB], size: [varC, varD] }
   * When NO attributes exist (single default variant) we skip the selector.
   */
  const attributeGroups = (() => {
    const groups: Record<string, typeof product.variants> = {};
    for (const variant of product.variants) {
      const keys = Object.keys(variant.attributes).filter((k) => k !== "colorHex");
      if (keys.length === 0 && product.variants.length > 1) {
        // Fallback: If no attributes but multiple variants, group by a "Phiên bản" key
        if (!groups["Phiên bản"]) groups["Phiên bản"] = [];
        groups["Phiên bản"].push(variant);
        continue;
      }
      for (const key of keys) {
        if (!groups[key]) groups[key] = [];
        // Deduplicate variants per value (a variant appears once per attribute group)
        const seen = groups[key].some(
          (v) => v.attributes[key] === variant.attributes[key]
        );
        if (!seen) groups[key].push(variant);
      }
    }
    return groups;
  })();

  const hasAttributes = Object.keys(attributeGroups).length > 0;

  const discount = getDiscountPercentage(
    selectedVariant.price,
    selectedVariant.compareAtPrice || product.compareAtPrice
  );

  const category = categories.find((c) => c.id === product.categoryId);

  const { addItem } = useCart();

  const handleAddToCart = async () => {
    try {
      // Use the addItem from CartContext to ensure header count updates
      await addItem(Number(selectedVariant.id), quantity);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng";
      if (message.includes("403") || message.includes("401") || /token/i.test(message)) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
        router.push("/account/login");
        return false;
      }
      return false;
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      router.push("/checkout");
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích"
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết sản phẩm");
  };

  return (
    <div className="bg-gradient-to-b from-background via-primary-light/8 to-secondary/8">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Sản phẩm</BreadcrumbLink>
              </BreadcrumbItem>
              {category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/category/${category.slug}`}>
                      {category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <Image
                src={product.images[selectedImage]?.url || "/placeholder.jpg"}
                alt={product.images[selectedImage]?.alt || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isFlashSale && (
                  <div className="relative group/flame select-none self-start">
                    <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-25" />
                    <div className="relative flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.5)] border border-orange-400/20 animate-pulse">
                      <Flame className="h-3.5 w-3.5 fill-amber-300 text-amber-300 animate-bounce" />
                      <span>HOT SALE 🔥</span>
                    </div>
                  </div>
                )}
                {discount && (
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
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating.average)
                          ? "fill-warning text-warning"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{product.rating.average}</span>
                  <span className="text-muted-foreground">
                    ({product.rating.count} đánh giá)
                  </span>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground font-medium">Đã bán {product.totalSold}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(selectedVariant.price)}
              </span>
              { (selectedVariant.compareAtPrice || product.compareAtPrice || 0) > selectedVariant.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(selectedVariant.compareAtPrice || product.compareAtPrice || 0)}
                  </span>
                  {Boolean(discount && discount > 0) && (
                    <Badge variant="destructive">Tiết kiệm {discount}%</Badge>
                  )}
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Variants */}
            {hasAttributes && (
              <div className="space-y-4">
                {Object.entries(attributeGroups).map(([attrKey, groupVariants]) => {
                  // The "active" value for this attribute row
                  const activeValue = selectedVariant.attributes[attrKey];
                  return (
                    <div key={attrKey}>
                      <label className="block text-sm font-medium mb-2 capitalize">
                        {attrKey}:{" "}
                        <span className="text-primary">{activeValue}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {groupVariants.map((variant) => {
                          const isOutOfStock = variant.inventory <= 0;
                          const isSelected =
                            selectedVariant.attributes[attrKey] ===
                            variant.attributes[attrKey];
                          const hasColor = variant.attributes.colorHex;

                          return (
                            <button
                              key={variant.id}
                              onClick={() =>
                                !isOutOfStock && handleVariantSelect(variant)
                              }
                              disabled={isOutOfStock}
                              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : isOutOfStock
                                    ? "border-muted text-muted-foreground cursor-not-allowed opacity-50"
                                    : "border-border hover:border-primary/50"
                              }`}
                            >
                              {hasColor && (
                                <span
                                  className="w-4 h-4 rounded-full border border-border"
                                  style={{
                                    backgroundColor: variant.attributes.colorHex,
                                  }}
                                />
                              )}
                              <span>{variant.attributes[attrKey] || variant.name || variant.sku}</span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                              {isOutOfStock && (
                                <span className="absolute -top-2 -right-2 text-xs bg-muted px-1.5 rounded">
                                  Hết hàng
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none"
                  onClick={() =>
                    setQuantity(Math.min(selectedVariant.inventory, quantity + 1))
                  }
                  disabled={quantity >= selectedVariant.inventory}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Add to Cart */}
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={selectedVariant.inventory <= 0}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>

              {/* Wishlist */}
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 bg-transparent"
                onClick={handleWishlist}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? "fill-primary text-primary" : ""
                  }`}
                />
              </Button>

              {/* Share */}
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 bg-transparent"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Buy Now */}
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleBuyNow}
              disabled={selectedVariant.inventory <= 0}
            >
              Mua ngay
            </Button>

            {/* Stock Status */}
            <div className="text-sm">
              {selectedVariant.inventory > 0 ? (
                <span className="text-success flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Còn hàng ({selectedVariant.inventory} sản phẩm)
                </span>
              ) : (
                <span className="text-destructive">Hết hàng</span>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Miễn phí ship</p>
                  <p className="text-muted-foreground text-xs">Đơn từ 500K</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <RotateCcw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Đổi trả 30 ngày</p>
                  <p className="text-muted-foreground text-xs">Không cần lý do</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Chính hãng 100%</p>
                  <p className="text-muted-foreground text-xs">Cam kết chất lượng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Mô tả sản phẩm
              </TabsTrigger>
              <TabsTrigger
                value="ingredients"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Thành phần
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Đánh giá ({product.rating.count})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </TabsContent>
            <TabsContent value="ingredients" className="mt-6">
              {product.ingredients && product.ingredients.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Thành phần chính</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {product.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground">
                          {ingredient}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    * Danh sách thành phần có thể thay đổi. Vui lòng kiểm tra bao bì sản phẩm để biết thông tin chính xác nhất.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Thông tin thành phần chi tiết sẽ được cập nhật.
                </p>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <ProductReviews 
                productId={Number(product.id)} 
                averageRating={product.rating.average}
                totalReviews={product.rating.count}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold mb-6">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
