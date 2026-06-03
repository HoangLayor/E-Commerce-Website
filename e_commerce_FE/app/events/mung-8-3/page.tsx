"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { products, formatPrice } from "@/lib/data";
import { fetchPageBySlug, PageResponseDTO } from "@/lib/api";
import { Loader2 } from "lucide-react";
import {
  Heart,
  Gift,
  Sparkles,
  ArrowRight,
  Star,
  Flower2,
  ShoppingBag,
  Truck,
  Percent,
  Clock,
} from "lucide-react";

const giftSets = [
  {
    id: "gift_1",
    title: "Set Chăm Sóc Da Hoàn Hảo",
    description: "Serum Vitamin C + Kem Dưỡng Ẩm HA + Sữa Rửa Mặt",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop",
    originalPrice: 1180000,
    salePrice: 799000,
    discount: 32,
  },
  {
    id: "gift_2",
    title: "Set Trang Điểm Ngày Lễ",
    description: "Son Môi Lì + Kem Lót + Phấn Phủ + Mascara",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop",
    originalPrice: 960000,
    salePrice: 649000,
    discount: 32,
  },
  {
    id: "gift_3",
    title: "Set Spa Tại Nhà",
    description: "Mặt Nạ Collagen x5 + Toner + Kem Dưỡng Mắt",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop",
    originalPrice: 850000,
    salePrice: 569000,
    discount: 33,
  },
];

const vouchers = [
  {
    code: "LOVE83",
    description: "Giảm 83K cho đơn từ 400K",
    minOrder: 400000,
    discount: 83000,
  },
  {
    code: "WOMEN50",
    description: "Giảm 50% tối đa 150K",
    minOrder: 300000,
    discount: 150000,
  },
  {
    code: "BEAUTY8/3",
    description: "Giảm 30K cho đơn từ 200K",
    minOrder: 200000,
    discount: 30000,
  },
];

const featuredSlugs = [
  "serum-vitamin-c-20",
  "son-moi-li-velvet",
  "kem-duong-am-hyaluronic-acid",
  "mat-na-duong-am-collagen",
  "kem-duong-mat-chong-lao-hoa",
  "kem-chong-nang-spf50",
];

export default function WomensDayEventPage() {
  const [dbPage, setDbPage] = useState<PageResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const data = await fetchPageBySlug("mung-8-3");
        setDbPage(data);
      } catch (error) {
        console.error("Failed to load DB page:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, []);

  const getSection = (type: string, titlePattern?: string) => {
    return dbPage?.sections.find(s => {
      if (s.type !== type) return false;
      if (titlePattern && s.title) {
        return s.title.toLowerCase().includes(titlePattern.toLowerCase());
      }
      return true;
    });
  };

  const heroSec = getSection("HERO_SECTION");
  const voucherSec = getSection("CUSTOM_HTML");
  const giftSec = getSection("BENEFITS");
  const featuredSec = getSection("FEATURED_PRODUCTS");

  const featuredProducts = products.filter((p) =>
    featuredSlugs.includes(p.slug)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Banner */}
        {(!dbPage || !!heroSec) && (
          <section 
            style={heroSec?.configJson?.backgroundColor ? { backgroundColor: heroSec.configJson.backgroundColor, backgroundImage: "none" } : {}}
            className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-primary-light"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-pink-400 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-rose-300 blur-2xl" />
            </div>

            <div className="container mx-auto px-4 py-12 md:py-20 relative">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <div className="flex items-center justify-center gap-2">
                  <Flower2 className="h-5 w-5 text-primary animate-pulse" />
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary bg-primary/5 text-sm"
                  >
                    Chương trình đặc biệt
                  </Badge>
                  <Flower2 className="h-5 w-5 text-primary animate-pulse" />
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif">
                  {heroSec?.title ? (
                    <span className="text-primary">{heroSec.title}</span>
                  ) : (
                    <>
                      <span className="text-primary">Yêu Thương</span>{" "}
                      <span className="text-foreground">Phái Đẹp</span>
                    </>
                  )}
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                  {heroSec?.configJson?.subtitle || "Chào mừng ngày Quốc tế Phụ nữ 8/3 — GlowSkin gửi tặng bạn ưu đãi lên đến 50% cùng quà tặng đặc biệt"}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card rounded-full px-4 py-2 border border-border shadow-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>01/03 - 08/03/2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card rounded-full px-4 py-2 border border-border shadow-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Freeship đơn từ 200K</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card rounded-full px-4 py-2 border border-border shadow-sm">
                    <Gift className="h-4 w-4 text-primary" />
                    <span>Tặng quà đơn từ 500K</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Voucher Section */}
        {(!dbPage || !!voucherSec) && (
          <section className="py-10 bg-gradient-to-b from-background via-primary-light/10 to-secondary/8">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-6">
                <Percent className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold font-serif">
                  {voucherSec?.title || "Mã Giảm Giá 8/3"}
                </h2>
              </div>

              {voucherSec?.configJson?.html ? (
                <div dangerouslySetInnerHTML={{ __html: voucherSec.configJson.html }} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {vouchers.map((v) => (
                    <Card
                      key={v.code}
                      className="border-dashed border-primary/30 bg-primary/[0.03] overflow-hidden"
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
                          <Heart className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-primary text-lg tracking-wide">
                            {v.code}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {v.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Đơn tối thiểu {formatPrice(v.minOrder)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Gift Sets */}
        {(!dbPage || !!giftSec) && (
          <section className="py-10 bg-gradient-to-b from-secondary/10 via-primary-light/8 to-background">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-6">
                <Gift className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold font-serif">
                  {giftSec?.title || "Set Quà Tặng Đặc Biệt"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {giftSets.map((set) => (
                  <Card
                    key={set.id}
                    className="overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <Image
                        src={set.image}
                        alt={set.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 text-sm">
                        -{set.discount}%
                      </Badge>
                    </div>
                    <CardContent className="p-5 space-y-2">
                      <h3 className="font-bold text-lg">{set.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {set.description}
                      </p>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(set.salePrice)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(set.originalPrice)}
                        </span>
                      </div>
                      <Button className="w-full mt-2 bg-primary hover:bg-primary-hover text-primary-foreground">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Thêm vào giỏ
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        {(!dbPage || !!featuredSec) && (
          <section className="py-10 bg-gradient-to-b from-background via-primary-light/8 to-secondary/8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold font-serif">
                    {featuredSec?.title || "Gợi Ý Quà Tặng"}
                  </h2>
                </div>
                <Link href="/products">
                  <Button variant="ghost" className="text-primary">
                    Xem tất cả <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Benefits Banner */}
        <section className="py-10 bg-gradient-to-r from-primary/5 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Freeship Đơn Từ 200K</h3>
                <p className="text-sm text-muted-foreground">
                  Giao hàng miễn phí toàn quốc trong dịp 8/3
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Tặng Quà Đơn Từ 500K</h3>
                <p className="text-sm text-muted-foreground">
                  Nhận ngay túi quà xinh xắn kèm mẫu thử
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Đổi Trả Miễn Phí 30 Ngày</h3>
                <p className="text-sm text-muted-foreground">
                  Yên tâm mua sắm, đổi trả dễ dàng
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
