"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ArrowRight,
  Sparkles,
  Truck,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { fetchSettings } from "@/lib/api";

interface BannerItem {
  image: string;
  title: string;
  subtitle: string;
  href: string;
}

interface AdBannerProps {
  variant?: "top" | "inline";
  banners?: BannerItem[];
}

/* ── Main promotional banners (top carousel) ── */
const fallbackPromoBanners: BannerItem[] = [
  {
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=500&fit=crop",
    title: "Mỹ phẩm chính hãng",
    subtitle: "Giảm đến 50% toàn bộ thương hiệu",
    href: "/sale",
  },
  {
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=500&fit=crop",
    title: "Skincare Hàn Quốc",
    subtitle: "Mua 1 tặng 1 hàng ngàn sản phẩm",
    href: "/products?category=skincare",
  },
  {
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1200&h=500&fit=crop",
    title: "Chống nắng mùa hè",
    subtitle: "Ưu đãi đặc biệt từ Anessa & Skin Aqua",
    href: "/products?category=sunscreen",
  },
  {
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&h=500&fit=crop",
    title: "Dưỡng da cao cấp",
    subtitle: "Lấy voucher ngay - Freeship đơn từ 300K",
    href: "/vouchers",
  },
];

/* ── Brand items (bottom carousel row) ── */
const fallbackBrands = [
  {
    name: "La Roche-Posay",
    image:
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop",
    promo: "Ưu đãi đến 50%",
    href: "/products?brand=laroche",
  },
  {
    name: "CeraVe",
    image:
      "https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=400&h=400&fit=crop",
    promo: "Mua 1 tặng 1",
    href: "/products?brand=cerave",
  },
  {
    name: "The Ordinary",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    promo: "Giảm đến 40%",
    href: "/products?brand=theordinary",
  },
  {
    name: "Innisfree",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
    promo: "Mua là có quà",
    href: "/products?brand=innisfree",
  },
  {
    name: "Bioderma",
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop",
    promo: "Mua 2 giảm 30%",
    href: "/products?brand=bioderma",
  },
  {
    name: "Cocoon",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",
    promo: "Mua 1 được 2",
    href: "/products?brand=cocoon",
  },
  {
    name: "Klairs",
    image:
      "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop",
    promo: "Giảm đến 35%",
    href: "/products?brand=klairs",
  },
  {
    name: "Laneige",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    promo: "Mua 1 tặng 1",
    href: "/products?brand=laneige",
  },
  {
    name: "Anessa",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop",
    promo: "Ưu đãi đến 45%",
    href: "/products?brand=anessa",
  },
  {
    name: "Senka",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop",
    promo: "Mua là có quà",
    href: "/products?brand=senka",
  },
  {
    name: "AHC",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
    promo: "Mua 1 tặng 4",
    href: "/products?brand=ahc",
  },
  {
    name: "Garnier",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",
    promo: "Mua là có quà",
    href: "/products?brand=garnier",
  },
];

export function AdBanner({ variant = "inline", banners }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [topBannerShow] = useState(false);
  const [topBannerTextLeft] = useState("");
  const [topBannerTextRight] = useState("");
  const [topBannerLinkText] = useState("");
  const [topBannerLinkUrl] = useState("/sale");
  const [dynamicBrands, setDynamicBrands] = useState<any[]>(fallbackBrands);
  const [dynamicPromoBanners, setDynamicPromoBanners] = useState<BannerItem[]>(fallbackPromoBanners);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchSettings();
        const settingsMap = data.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {} as Record<string, string>);

        if (settingsMap["brands_list_json"]) {
          try {
            const parsed = JSON.parse(settingsMap["brands_list_json"]);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setDynamicBrands(parsed);
            }
          } catch (e) {
            console.error("Failed to parse dynamic brands json", e);
          }
        }
        if (settingsMap["promo_banners_json"]) {
          try {
            const parsed = JSON.parse(settingsMap["promo_banners_json"]);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setDynamicPromoBanners(parsed);
            }
          } catch (e) {
            console.error("Failed to parse dynamic promo banners json", e);
          }
        }
      } catch (err) {
        console.error("Failed to load storefront banner settings:", err);
      }
    }
    loadSettings();
  }, []);

  /* ── Main banner carousel state ── */
  const [bannerApi, setBannerApi] = useState<CarouselApi>();
  const [bannerCurrent, setBannerCurrent] = useState(0);
  const [bannerCount, setBannerCount] = useState(0);

  useEffect(() => {
    if (!bannerApi) return;
    const onSelect = () => {
      setBannerCurrent(bannerApi.selectedScrollSnap());
      setBannerCount(bannerApi.scrollSnapList().length);
    };
    onSelect();
    bannerApi.on("select", onSelect);
    bannerApi.on("reInit", onSelect);
    return () => {
      bannerApi.off("select", onSelect);
      bannerApi.off("reInit", onSelect);
    };
  }, [bannerApi]);

  /* ── Brand row scroll state ── */
  const brandScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateBrandScroll = useCallback(() => {
    const el = brandScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = brandScrollRef.current;
    if (!el) return;
    updateBrandScroll();
    el.addEventListener("scroll", updateBrandScroll, { passive: true });
    return () => el.removeEventListener("scroll", updateBrandScroll);
  }, [updateBrandScroll]);

  const scrollBrand = useCallback(
    (dir: "left" | "right") => {
      const el = brandScrollRef.current;
      if (!el) return;
      const scrollAmount = el.clientWidth * 0.8;
      el.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    },
    []
  );

  const activeBanners = banners && banners.length > 0 ? banners : dynamicPromoBanners;

  if ((!isVisible || !topBannerShow) && variant === "top") return null;

  /* ═══════ TOP VARIANT ═══════ */
  if (variant === "top") {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-rose-400 to-primary-hover text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-0.5 left-[10%] text-white/10 text-sm">✿</span>
          <span className="absolute bottom-0.5 left-[30%] text-white/10 text-xs">♡</span>
          <span className="absolute top-0 right-[20%] text-white/10 text-sm">✦</span>
          <span className="absolute bottom-0 left-[60%] text-white/10 text-xs">❀</span>
        </div>
        <div className="container relative mx-auto px-4 py-2.5">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="font-medium">
                {topBannerTextLeft}
              </span>
            </div>
            <span className="hidden sm:inline text-primary-foreground/40">
              |
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">
                {topBannerTextRight}
              </span>
            </div>
            <Link
              href={topBannerLinkUrl}
              className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 font-semibold backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              {topBannerLinkText}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  /* ═══════ INLINE VARIANT — Shopee-style ═══════ */
  return (
    <section className="py-6 lg:py-8">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
          {/* ── Section Header ── */}
          <div className="relative flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-primary via-rose-400 to-primary-hover overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-1 left-[15%] text-white/10 text-xl">✦</span>
              <span className="absolute bottom-0.5 left-[40%] text-white/10 text-2xl">✿</span>
              <span className="absolute top-0 right-[25%] text-white/10 text-lg">♡</span>
              <span className="absolute bottom-1 right-[10%] text-white/10 text-xl">❀</span>
              <div className="absolute -top-4 left-[55%] w-16 h-16 rounded-full bg-white/[0.05] blur-lg" />
              <div className="absolute -bottom-4 left-[30%] w-12 h-12 rounded-full bg-white/[0.05] blur-lg" />
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.08)_50%,transparent_75%)] bg-[length:250%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary-foreground drop-shadow-md" />
              <h2 className="text-primary-foreground font-bold text-lg tracking-wide drop-shadow-sm">
                Thương Hiệu Chính Hãng
              </h2>
              <span className="text-white/50 text-xs">✦</span>
            </div>
            <Link
              href="/products"
              className="relative flex items-center gap-1 text-sm text-primary-foreground/90 hover:text-primary-foreground font-medium transition-colors"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* ── Main Promotional Banner Carousel ── */}
          <div className="relative group/banner">
            <Carousel
              setApi={setBannerApi}
              opts={{ align: "start", loop: true }}
              plugins={[
                Autoplay({
                  delay: 3500,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {activeBanners.map((banner, i) => (
                  <CarouselItem key={i}>
                    <Link href={banner.href} className="block">
                      <div className="relative w-full aspect-[2.4/1] overflow-hidden bg-primary-light">
                        <Image
                          src={banner.image}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          priority={i === 0}
                        />
                        {/* Gradient overlay + text */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
                        {/* Decorative floating elements */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <span className="absolute top-[12%] right-[10%] text-white/15 text-3xl lg:text-4xl animate-pulse">✿</span>
                          <span className="absolute top-[30%] right-[28%] text-white/10 text-2xl animate-pulse [animation-delay:0.7s]">✦</span>
                          <span className="absolute bottom-[18%] right-[15%] text-white/15 text-2xl lg:text-3xl animate-pulse [animation-delay:1.2s]">♡</span>
                          <div className="absolute -top-6 right-[5%] w-28 h-28 rounded-full bg-white/[0.06] blur-xl" />
                          <div className="absolute bottom-4 right-[22%] w-16 h-16 rounded-full bg-white/[0.04] blur-lg" />
                        </div>
                        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
                          <span className="text-white/80 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
                            <span className="text-white/50">✦</span> GlowSkin Mall <span className="text-white/50">✦</span>
                          </span>
                          <h3 className="text-white font-bold text-lg sm:text-2xl lg:text-3xl leading-tight mb-1.5">
                            {banner.title}
                          </h3>
                          <p className="text-white/90 text-sm sm:text-base">
                            {banner.subtitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Banner dots */}
              {bannerCount > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {Array.from({ length: bannerCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => bannerApi?.scrollTo(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        bannerCurrent === i
                          ? "w-6 bg-primary-foreground"
                          : "w-1.5 bg-primary-foreground/50 hover:bg-primary-foreground/70"
                      )}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Banner arrows */}
              <button
                onClick={() => bannerApi?.scrollPrev()}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card/80 shadow border border-border flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity hover:bg-card"
                aria-label="Trước"
              >
                <ChevronLeft className="h-4 w-4 text-foreground/70" />
              </button>
              <button
                onClick={() => bannerApi?.scrollNext()}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card/80 shadow border border-border flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity hover:bg-card"
                aria-label="Sau"
              >
                <ChevronRight className="h-4 w-4 text-foreground/70" />
              </button>
            </Carousel>
          </div>

          {/* ── Brand Items Row (Shopee-style horizontal scroll) ── */}
          <div className="relative group/brands border-t border-border/50">
            <div
              ref={brandScrollRef}
              className="flex overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {dynamicBrands.map((brand, i) => (
                <Link
                  key={i}
                  href={brand.href}
                  className="flex-shrink-0 w-[calc(100%/4)] sm:w-[calc(100%/5)] md:w-[calc(100%/6)] lg:w-[12.5%] border-r border-border/30 last:border-r-0 group/card hover:bg-accent/30 transition-colors"
                >
                  <div className="p-2 pb-3 flex flex-col items-center text-center">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border/50 bg-background mb-2 group-hover/card:border-primary/50 group-hover/card:shadow-md transition-all">
                      <Image
                        src={brand.image}
                        alt={brand.name}
                        fill
                        className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[11px] font-medium text-primary line-clamp-1 leading-tight">
                      {brand.promo}
                    </span>
                  </div>
                </Link>
              ))}

              {/* "Xem tất cả" card */}
              <Link
                href="/products"
                className="flex-shrink-0 w-[calc(100%/4)] sm:w-[calc(100%/5)] md:w-[calc(100%/6)] lg:w-[12.5%] group/card hover:bg-accent/30 transition-colors"
              >
                <div className="p-2 pb-3 flex flex-col items-center text-center">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border/50 bg-primary-light mb-2 flex items-center justify-center group-hover/card:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center gap-1.5 text-primary">
                      <div className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center group-hover/card:bg-primary group-hover/card:text-primary-foreground transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-semibold">
                        Xem tất cả
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-primary line-clamp-1 leading-tight">
                    &nbsp;
                  </span>
                </div>
              </Link>
            </div>

            {/* Brand row scroll arrows */}
            {canScrollLeft && (
              <button
                onClick={() => scrollBrand("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-12 bg-card/90 shadow-md border border-border rounded-r-lg flex items-center justify-center opacity-0 group-hover/brands:opacity-100 transition-opacity hover:bg-card"
                aria-label="Cuộn trái"
              >
                <ChevronLeft className="h-4 w-4 text-foreground/70" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scrollBrand("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-12 bg-card/90 shadow-md border border-border rounded-l-lg flex items-center justify-center opacity-0 group-hover/brands:opacity-100 transition-opacity hover:bg-card"
                aria-label="Cuộn phải"
              >
                <ChevronRight className="h-4 w-4 text-foreground/70" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
