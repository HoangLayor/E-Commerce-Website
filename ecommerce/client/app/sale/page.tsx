"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchActiveFlashSales, fetchPageBySlug, PageResponseDTO, type FlashSaleResponse } from "@/lib/api";
import { formatPrice } from "@/lib/data";
import {
  Clock,
  Zap,
  Gift,
  Percent,
  Flame,
  Copy,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getSoldLabel(sold: number, total: number) {
  const percent = total > 0 ? (sold / total) * 100 : 0;
  if (percent >= 100) return "ĐÃ BÁN HẾT";
  if (percent >= 80) return `CHỈ CÒN ${Math.max(total - sold, 0)}`;
  if (sold >= 5) return `Đã bán ${sold}`;
  return "ĐANG BÁN CHẠY";
}

export default function SalePage() {
  const [activeCampaign, setActiveCampaign] = useState<FlashSaleResponse | null>(null);
  const [dbPage, setDbPage] = useState<PageResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [colonVisible, setColonVisible] = useState(true);

  // Fetch flash sale & layout data
  useEffect(() => {
    async function loadData() {
      try {
        const [salesData, pageData] = await Promise.all([
          fetchActiveFlashSales(),
          fetchPageBySlug("sale")
        ]);

        setDbPage(pageData);

        const now = new Date();
        const validCampaigns = salesData.filter(c => c.isActive && new Date(c.endTime) > now && new Date(c.startTime) <= now);

        if (validCampaigns.length > 0) {
          validCampaigns.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
          setActiveCampaign(validCampaigns[0]);
        } else {
          const upcoming = salesData.filter(c => c.isActive && new Date(c.startTime) > now);
          if (upcoming.length > 0) {
            upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            setActiveCampaign(upcoming[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load flash sales or page layout:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!activeCampaign) return;
    function calcTimeLeft() {
      const now = new Date();
      const end = new Date(activeCampaign!.endTime);
      const start = new Date(activeCampaign!.startTime);
      const targetTime = now < start ? start : end;

      const diff = targetTime.getTime() - now.getTime();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }

    setTimeLeft(calcTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft());
      setColonVisible((v) => !v);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCampaign]);

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
  const flashSaleSec = getSection("FLASH_SALE") || getSection("FEATURED_PRODUCTS");

  const pad = (n: number) => n.toString().padStart(2, "0");
  const isUpcoming = activeCampaign ? new Date() < new Date(activeCampaign.startTime) : false;

  const voucherCodes = [
    {
      code: "WELCOME10",
      discount: "10%",
      description: "Giảm 10% đơn hàng đầu tiên",
      minOrder: 300000,
      expiry: "31/03/2026",
    },
    {
      code: "SUMMER20",
      discount: "20%",
      description: "Giảm 20% danh mục Chăm sóc da",
      minOrder: 500000,
      expiry: "28/02/2026",
    },
    {
      code: "FREESHIP",
      discount: "Freeship",
      description: "Miễn phí vận chuyển toàn quốc",
      minOrder: 200000,
      expiry: "28/02/2026",
    },
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã ${code}`);
  };

  if (isLoading) {
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
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Header />
      <main className="flex-1">
        {/* Premium Hero Banner */}
        {(!dbPage || !!heroSec) && (
          <section
            style={heroSec?.configJson?.backgroundColor ? { backgroundColor: heroSec.configJson.backgroundColor, backgroundImage: "none" } : {}}
            className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-primary to-primary-hover py-12 lg:py-20"
          >
            {/* Animated decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-10 left-[10%] text-white/20 text-4xl animate-bounce" style={{ animationDuration: '4s' }}>✿</div>
              <div className="absolute bottom-10 right-[15%] text-white/10 text-3xl animate-pulse">❤</div>
              <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] animate-pulse" />
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_100%] animate-[shimmer_3s_infinite]" />
              <div className="absolute top-20 right-[30%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 left-[20%] w-80 h-80 bg-rose-400/20 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-3xl mx-auto text-center text-primary-foreground">
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-8 border border-white/20 shadow-lg animate-fade-in">
                  <Flame className="h-4 w-4 text-orange-300" />
                  {heroSec?.title || activeCampaign?.name || "MEGA SALE EVENT"}
                </span>
                <h1 className="font-extrabold text-5xl md:text-7xl lg:text-8xl mb-6 tracking-tighter drop-shadow-2xl animate-fade-up">
                  FLASH <span className="text-white">SALE</span>
                </h1>
                <p className="text-lg md:text-2xl mb-10 text-white/90 font-medium tracking-tight animate-fade-up delay-100">
                  {heroSec?.configJson?.subtitle || "Săn ngay ngàn ưu đãi với mức giá giảm sốc chưa từng có."}
                </p>

                {/* Massive Countdown */}
                {activeCampaign && (
                  <div className="inline-flex items-center gap-3 p-6 rounded-3xl bg-white/15 backdrop-blur-lg border border-white/20 shadow-2xl animate-fade-up delay-200">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/30 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                          <span className="text-2xl md:text-3xl font-black">{pad(timeLeft.hours)}</span>
                        </div>
                        <span className={cn("text-2xl font-bold transition-opacity", !colonVisible && "opacity-30")}>:</span>
                        <div className="bg-white/30 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                          <span className="text-2xl md:text-3xl font-black">{pad(timeLeft.minutes)}</span>
                        </div>
                        <span className={cn("text-2xl font-bold transition-opacity", !colonVisible && "opacity-30")}>:</span>
                        <div className="bg-white/30 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                          <span className="text-2xl md:text-3xl font-black">{pad(timeLeft.seconds)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-80 mt-1">
                        {isUpcoming ? "Bắt đầu sau" : "Kết thúc sau"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Voucher Section - Ticket Style */}
        {(!dbPage || !!voucherSec) && (
          <section className="py-16 bg-background relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
                  {voucherSec?.title || "KHO VOUCHER"}
                </h2>
                <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-4" />
                <p className="text-muted-foreground text-lg">Mã giảm giá độc quyền dành riêng cho bạn</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {voucherCodes.map((voucher) => (
                  <div key={voucher.code} className="relative group overflow-hidden">
                    {/* The Ticket Card */}
                    <div className="relative bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-r border-border" />
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-l border-border" />

                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                          {voucher.discount.includes("%") ? <Percent className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
                        </div>
                        <Badge className="bg-primary text-white font-bold">{voucher.discount}</Badge>
                      </div>

                      <h3 className="text-xl font-black mb-1 group-hover:text-primary transition-colors">{voucher.code}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{voucher.description}</p>

                      <div className="pt-4 border-t border-dashed border-border/60 flex flex-col gap-2">
                        <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          <span>Đơn từ {formatPrice(voucher.minOrder)}</span>
                          <span>HSD: {voucher.expiry}</span>
                        </div>
                        <Button
                          onClick={() => handleCopyCode(voucher.code)}
                          className="w-full mt-2 rounded-xl group/btn"
                          variant="outline"
                        >
                          <Copy className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                          Sao chép mã
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Flash Sale Grid Section */}
        {(!dbPage || !!flashSaleSec) && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-500 rounded-lg shadow-lg shadow-rose-500/20">
                      <Zap className="h-6 w-6 text-white fill-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter uppercase">
                      {flashSaleSec?.title || "Flash Deals"}
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-lg">Săn hot deal chớp nhoáng với giá cực hời</p>
                </div>

                {activeCampaign && (
                  <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white shadow-sm border border-border">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-bold text-sm">{isUpcoming ? "Bắt đầu trong:" : "Kết thúc trong:"}</span>
                    <span className="font-mono font-black text-primary">{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {!activeCampaign || activeCampaign.products.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-muted-foreground bg-white rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center gap-4">
                    <Zap className="h-12 w-12 text-muted" />
                    <h3 className="text-2xl font-bold">Chưa có sự kiện Flash Sale</h3>
                    <p>Vui lòng quay lại sau nhé!</p>
                  </div>
                ) : (
                  activeCampaign.products.map((product) => {
                    const discount = product.originalPrice > 0 ? Math.round((1 - product.salePrice / product.originalPrice) * 100) : 0;
                    const sold = product.soldQuantity || 0;
                    const total = product.quantity || 1;
                    const soldPercent = Math.min(Math.round((sold / total) * 100), 100);
                    const isAlmostGone = soldPercent >= 80 && soldPercent < 100;
                    const isSoldOut = soldPercent >= 100;
                    const label = getSoldLabel(sold, total);

                    return (
                      <Link
                        key={product.id}
                        href={`/products?keyword=${encodeURIComponent(product.productName)}`}
                        className={`group/card relative flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isSoldOut ? 'opacity-60 grayscale-[50%] cursor-not-allowed' : ''}`}
                        onClick={(e) => isSoldOut && e.preventDefault()}
                      >
                        {/* Image + discount badge */}
                        <div className="relative aspect-square overflow-hidden bg-muted/20">
                          <Image
                            src={product.image || "/placeholder-product.png"}
                            alt={product.productName}
                            fill
                            className="object-cover group-hover/card:scale-110 transition-transform duration-500"
                          />
                          {/* Burning Fire Flash Sale Tag */}
                          {!isSoldOut && (
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-[0_2px_8px_rgba(249,115,22,0.5)] border border-orange-400/20 animate-pulse">
                              <Flame className="h-3 w-3 fill-amber-300 text-amber-300 animate-bounce" />
                              <span>HOT 🔥</span>
                            </div>
                          )}

                          {/* Discount badge */}
                          {discount > 0 && !isSoldOut && (
                            <div className="absolute top-2 right-2 flex flex-col items-center">
                              <div className="relative">
                                <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-25" />
                                <div className="relative bg-gradient-to-br from-rose-500 to-primary text-primary-foreground text-xs font-black px-2.5 py-1 rounded-full shadow-lg border border-white/20">
                                  -{discount}%
                                </div>
                              </div>
                            </div>
                          )}

                          {isSoldOut && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                              <div className="bg-black/70 text-white font-bold text-sm px-4 py-2 border-2 border-white/20 rotate-[-15deg] shadow-2xl rounded-sm tracking-widest">
                                ĐÃ BÁN HẾT
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4 flex flex-col flex-grow">
                          <div className="font-bold text-sm line-clamp-2 mb-2 group-hover/card:text-primary transition-colors min-h-[2.5rem]">
                            {product.productName}
                          </div>

                          {product.maxPerUser > 0 && (
                            <div className="text-[10px] text-muted-foreground font-medium mb-2 border border-muted-foreground/30 px-2 py-0.5 rounded w-max">
                              Tối đa {product.maxPerUser} SP / khách
                            </div>
                          )}

                          <div className="mt-auto">
                            <div className="flex flex-col mb-3">
                              <span className="text-primary font-black text-lg">
                                {formatPrice(product.salePrice)}
                              </span>
                              {product.originalPrice > product.salePrice && (
                                <span className="text-muted-foreground text-xs line-through opacity-70">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-6 rounded-full bg-muted overflow-hidden border border-border shadow-inner">
                              <div
                                className={cn(
                                  "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out flex items-center justify-center",
                                  isSoldOut ? "bg-gray-400" :
                                    isAlmostGone
                                      ? "bg-gradient-to-r from-rose-500 via-primary to-rose-600 animate-pulse"
                                      : "bg-gradient-to-r from-orange-400 to-rose-500"
                                )}
                                style={{ width: `${Math.max(soldPercent, 5)}%` }}
                              >
                                {/* Animated Stripes */}
                                {!isSoldOut && (
                                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-pulse_1s_linear_infinite]" />
                                )}
                              </div>
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference uppercase tracking-tight">
                                {isAlmostGone ? "⚠ SẮP HẾT" : label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}

        {/* Promotional Banners */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="relative group rounded-[2rem] overflow-hidden min-h-[350px] flex px-10 py-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-light/40 to-pink-100/50 -z-10" />
                <div className="absolute top-0 right-0 w-1/2 h-full -z-10">
                  <div className="absolute top-10 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                </div>

                <div className="flex flex-col justify-between items-start max-w-sm">
                  <div>
                    <Badge className="mb-4 py-1.5 px-4 rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 font-black text-[11px] tracking-widest uppercase">Skincare Deals</Badge>
                    <h3 className="text-4xl font-extrabold mb-4 leading-tight tracking-tighter">PHỤC HỒI DA <br /><span className="text-primary">-30%</span></h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">Nuôi dưỡng làn da căng mỏng với trọn bộ dưỡng ẩm HA & Vitamin B5.</p>
                  </div>
                  <Button asChild size="lg" className="rounded-2xl px-8 shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
                    <Link href="/products">
                      Mua ngay <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative group rounded-[2rem] overflow-hidden min-h-[350px] flex px-10 py-12">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-orange-100/40 -z-10" />
                <div className="absolute top-0 right-0 w-1/2 h-full -z-10">
                  <div className="absolute top-10 right-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl animate-pulse" />
                </div>

                <div className="flex flex-col justify-between items-start max-w-sm">
                  <div>
                    <Badge className="mb-4 py-1.5 px-4 rounded-full bg-secondary-foreground/10 text-secondary-foreground border-secondary-foreground/20 hover:bg-secondary-foreground/15 font-black text-[11px] tracking-widest uppercase">Makeup Special</Badge>
                    <h3 className="text-4xl font-extrabold mb-4 leading-tight tracking-tighter">MUA 2 TẶNG 1 <br /><span className="text-secondary-foreground">SON & PHẤN</span></h3>
                    <p className="text-secondary-foreground/70 text-lg leading-relaxed">Ưu đãi độc quyền cho tất cả dòng son môi và phấn phủ chính hãng.</p>
                  </div>
                  <Button asChild size="lg" variant="secondary" className="rounded-2xl px-8 shadow-xl shadow-secondary-foreground/20 bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 group-hover:scale-105 transition-transform">
                    <Link href="/products">
                      Khám phá <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="py-24 bg-gradient-to-br from-primary via-rose-500 to-primary-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjA1IiBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L3N2Zz4=')] opacity-20" />
          <div className="container mx-auto px-4 relative z-10 text-center text-primary-foreground">
            <div className="max-w-2xl mx-auto">
              <Gift className="h-16 w-16 mx-auto mb-6 opacity-80 animate-bounce" style={{ animationDuration: '3s' }} />
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tighter">ĐĂNG KÝ NHẬN MEGA DEALS</h2>
              <p className="text-xl text-primary-foreground/80 mb-10 leading-relaxed font-medium">Bạn sẽ không bao giờ bỏ lỡ các chương trình giảm giá chớp nhoáng và bộ sưu tập phiên bản giới hạn.</p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md transition-all"
                />
                <Button size="lg" variant="secondary" className="px-10 py-7 text-lg rounded-2xl shadow-2xl hover:scale-105 transition-transform text-black bg-white">
                  Đăng ký ngay
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
