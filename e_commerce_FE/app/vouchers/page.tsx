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
import { fetchPublicVouchers, fetchPageBySlug, PageResponseDTO, type Voucher } from "@/lib/api";
import { toast } from "sonner";
import {
  Gift,
  Percent,
  Tag,
  Truck,
  Clock,
  Loader2,
  CheckCircle2,
} from "lucide-react";

// Mock combo deals for now
const comboDeals = [
  {
    id: "combo_1",
    title: "Bộ Skincare Cơ Bản",
    description: "Sữa rửa mặt + Toner + Serum Vitamin C",
    originalPrice: 990000,
    comboPrice: 790000,
    saving: 200000,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=400&fit=crop",
  },
  {
    id: "combo_2",
    title: "Bộ Chống Nắng Hoàn Hảo",
    description: "Kem chống nắng + Serum + Kem dưỡng ẩm",
    originalPrice: 1150000,
    comboPrice: 890000,
    saving: 260000,
    image:
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=400&fit=crop",
  },
];

const saleProducts = products.filter((p) => p.compareAtPrice !== null);

const getVoucherIcon = (type: string) => {
  switch (type) {
    case "PERCENT":
      return { icon: Percent, color: "text-primary", bgColor: "bg-primary/10" };
    case "SHIPPING":
      return { icon: Truck, color: "text-green-600", bgColor: "bg-green-50" };
    case "FIXED":
    default:
      return { icon: Gift, color: "text-blue-600", bgColor: "bg-blue-50" };
  }
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [dbPage, setDbPage] = useState<PageResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [vouchersData, pageData] = await Promise.all([
          fetchPublicVouchers(),
          fetchPageBySlug("vouchers")
        ]);
        setVouchers(vouchersData || []);
        setDbPage(pageData);
      } catch (error) {
        console.error("Failed to fetch vouchers or page layout:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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
  const voucherListSec = getSection("CUSTOM_HTML");

  const activeVouchers = vouchers.filter((v) => v.isActive);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
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
        {/* Banner */}
        {(!dbPage || !!heroSec) && (
          <section 
            style={heroSec?.configJson?.backgroundColor ? { backgroundColor: heroSec.configJson.backgroundColor, backgroundImage: "none" } : {}}
            className="relative bg-gradient-to-r from-primary/90 to-primary-hover py-12 lg:py-16 text-white overflow-hidden"
          >
            <div className="container mx-auto px-4 relative z-10 text-center">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">Ưu đãi độc quyền</Badge>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                {heroSec?.title || "Mã Giảm Giá & Voucher"}
              </h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                {heroSec?.configJson?.subtitle || "Sử dụng các mã ưu đãi dưới đây để nhận được mức giá tốt nhất cho lộ trình chăm sóc da của bạn."}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </section>
        )}

        {/* Vouchers Grid */}
        {(!dbPage || !!voucherListSec) && (
          <section className="py-12 lg:py-20">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl md:text-3xl font-bold">
                  {voucherListSec?.title || "Voucher đang hoạt động"}
                </h2>
                <span className="text-muted-foreground">{activeVouchers.length} mã khả dụng</span>
              </div>

              {activeVouchers.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground">Hiện chưa có mã giảm giá nào. Hãy quay lại sau nhé!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {activeVouchers.map((voucher) => {
                    const theme = getVoucherIcon(voucher.type);
                    const Icon = theme.icon;
                    return (
                      <Card key={voucher.id} className="overflow-hidden border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all">
                        <CardContent className="p-0 flex flex-col sm:flex-row">
                          <div className={`sm:w-32 ${theme.bgColor} flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-dashed border-primary/20`}>
                            <Icon className={`h-10 w-10 ${theme.color} mb-2`} />
                            <span className={`text-xs font-bold uppercase tracking-wider ${theme.color}`}>
                              {voucher.type === "PERCENT" ? "Giảm %" : voucher.type === "SHIPPING" ? "Freeship" : "Giảm tiền"}
                            </span>
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg">
                                {voucher.type === "PERCENT" 
                                  ? `Giảm ${voucher.value}% cho mọi đơn hàng` 
                                  : voucher.type === "FIXED"
                                    ? `Giảm ${formatPrice(voucher.value)} trực tiếp`
                                    : "Miễn phí vận chuyển toàn quốc"}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              Đơn tối thiểu {formatPrice(voucher.minOrderValue)}. 
                              {voucher.maxDiscount ? ` Giảm tối đa ${formatPrice(voucher.maxDiscount)}.` : ""}
                            </p>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                              <code className="flex-1 text-lg font-mono font-bold text-primary tracking-widest">{voucher.code}</code>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  navigator.clipboard.writeText(voucher.code);
                                  toast.success("Đã sao chép mã!");
                                }}
                              >
                                Sao chép
                              </Button>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                HSD: {new Date(voucher.expiryDate).toLocaleDateString("vi-VN")}
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                {voucher.usageLimit ? `Còn ${voucher.usageLimit - voucher.usedCount} lượt` : "Không giới hạn"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Combos */}
        <section className="py-12 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold mb-4">Mua theo Combo - Tiết kiệm tối đa</h2>
              <p className="text-muted-foreground">Những bộ sản phẩm được GlowSkin thiết kế tối ưu cho làn da và ví tiền của bạn.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {comboDeals.map(combo => (
                <Card key={combo.id} className="overflow-hidden group">
                  <div className="relative aspect-[16/9]">
                    <Image src={combo.image} alt={combo.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-destructive text-white border-none">Tiết kiệm {formatPrice(combo.saving)}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">{combo.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{combo.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">{formatPrice(combo.comboPrice)}</span>
                        <span className="ml-2 text-sm text-muted-foreground line-through">{formatPrice(combo.originalPrice)}</span>
                      </div>
                      <Button asChild>
                        <Link href="/products">Mua ngay</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sale Products */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Sản phẩm đang giảm giá</h2>
                <p className="text-muted-foreground">Giá cực sốc cho những sản phẩm bán chạy nhất tuần này.</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/products?sale=true">Xem tất cả</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {saleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
