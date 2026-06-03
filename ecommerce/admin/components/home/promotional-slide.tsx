"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Sun,
  Sparkles,
  Heart,
  Flower2,
  Palette,
  ShieldCheck,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// Map tên icon (string từ DB) → Lucide component
const iconMap: Record<string, LucideIcon> = {
  Droplets,
  Sun,
  Sparkles,
  Heart,
  Flower2,
  Palette,
  ShieldCheck,
  Gift,
};

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  gradient: string;
  accent?: string;
  decorations?: string[];
}

interface SideBanner {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  gradient: string;
  accent?: string;
}

interface QuickLinkData {
  iconName: string;
  label: string;
  href: string;
}

interface PromotionalSlideProps {
  slides?: Slide[];
  sideBanners?: SideBanner[];
  quickLinks?: QuickLinkData[];
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    title: "Flash Sale Mùa Hè",
    subtitle: "Giảm đến 50% tất cả sản phẩm chống nắng",
    cta: "Mua ngay",
    href: "/sale",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1400&h=600&fit=crop",
    gradient: "from-rose-400/40 via-pink-300/30 to-rose-200/40",
    accent: "✿",
    decorations: ["✦", "♡", "✿", "·"],
  },
  {
    id: 2,
    title: "Bộ Sưu Tập Mới",
    subtitle: "Khám phá dòng skincare Hàn Quốc chính hãng",
    cta: "Khám phá",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1200&h=500&fit=crop",
    gradient: "from-violet-400/50 via-purple-300/40 to-fuchsia-300/50",
    accent: "❋",
    decorations: ["✧", "❋", "♢", "·"],
  },
  {
    id: 3,
    title: "Ưu Đãi Thành Viên",
    subtitle: "Đăng ký ngay – Nhận voucher 100K cho đơn đầu tiên",
    cta: "Đăng ký",
    href: "/account/login",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=500&fit=crop",
    gradient: "from-amber-300/50 via-orange-300/40 to-yellow-200/50",
    accent: "♡",
    decorations: ["♡", "✦", "❀", "·"],
  },
  {
    id: 4,
    title: "Combo Tiết Kiệm",
    subtitle: "Mua trọn bộ skincare – Tiết kiệm đến 40%",
    cta: "Xem combo",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1200&h=500&fit=crop",
    gradient: "from-teal-300/50 via-emerald-300/40 to-cyan-200/50",
    accent: "✧",
    decorations: ["✿", "✧", "♡", "·"],
  },
];

const defaultSideBanners: SideBanner[] = [
  {
    title: "Mua 2 Tặng 1",
    subtitle: "Mặt nạ & Serum",
    href: "/sale",
    image:
      "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=600&h=300&fit=crop",
    gradient: "from-fuchsia-400/60 via-pink-400/50 to-rose-300/60",
    accent: "❀",
  },
  {
    title: "Freeship 0Đ",
    subtitle: "Cho đơn từ 300K",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=300&fit=crop",
    gradient: "from-sky-400/60 via-blue-300/50 to-indigo-300/60",
    accent: "✦",
  },
];

const defaultQuickLinks: QuickLinkData[] = [
  { iconName: "Droplets", label: "Chăm sóc da", href: "/category/cham-soc-da" },
  { iconName: "Sun", label: "Chống nắng", href: "/category/chong-nang" },
  { iconName: "Sparkles", label: "Làm sạch", href: "/category/lam-sach" },
  { iconName: "Heart", label: "Trang điểm", href: "/category/trang-diem" },
  { iconName: "Flower2", label: "Chăm sóc tóc", href: "/category/cham-soc-toc" },
  { iconName: "Palette", label: "Cơ thể", href: "/category/cham-soc-co-the" },
  { iconName: "ShieldCheck", label: "Sản phẩm", href: "/products" },
  { iconName: "Gift", label: "Voucher", href: "/vouchers" },
];

export function PromotionalSlide({ slides = defaultSlides, sideBanners = defaultSideBanners, quickLinks = defaultQuickLinks }: PromotionalSlideProps) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 2500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  return (
    <section className="py-4 lg:py-6">
      <div className="container mx-auto px-4">
        {/* Main layout: Carousel + Side banners */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Left: Main carousel */}
          <div
            className="relative flex-1 rounded-xl overflow-hidden group border border-border shadow-sm"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:h-full lg:min-h-[360px]">
              {slides.map((slide, index) => (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500 block",
                    index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  )}
                  tabIndex={index === current ? 0 : -1}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r",
                      slide.gradient
                    )}
                  />
                  {/* Decorative floating elements */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <span className="absolute top-[10%] right-[8%] text-white/20 text-4xl lg:text-5xl animate-pulse">{slide.decorations[0]}</span>
                    <span className="absolute top-[25%] right-[25%] text-white/15 text-2xl lg:text-3xl animate-pulse [animation-delay:0.5s]">{slide.decorations[1]}</span>
                    <span className="absolute bottom-[15%] right-[15%] text-white/20 text-3xl lg:text-4xl animate-pulse [animation-delay:1s]">{slide.decorations[2]}</span>
                    <span className="absolute top-[50%] right-[5%] text-white/10 text-5xl lg:text-6xl">{slide.decorations[0]}</span>
                    <span className="absolute bottom-[30%] right-[35%] text-white/10 text-xl animate-pulse [animation-delay:1.5s]">{slide.decorations[3]}</span>
                    {/* Soft bokeh circles */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/[0.07] blur-xl" />
                    <div className="absolute bottom-4 right-[20%] w-20 h-20 rounded-full bg-white/[0.05] blur-lg" />
                    <div className="absolute top-[30%] right-[40%] w-16 h-16 rounded-full bg-white/[0.06] blur-lg" />
                  </div>
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-8 lg:px-12">
                      <div className="max-w-md text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white/80 text-lg">{slide.accent}</span>
                          <span className="text-xs uppercase tracking-[0.2em] text-white/70 font-medium">GlowSkin</span>
                          <span className="text-white/80 text-lg">{slide.accent}</span>
                        </div>
                        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
                          {slide.title}
                        </h2>
                        <p className="text-white/90 text-sm lg:text-base mb-4 drop-shadow">
                          {slide.subtitle}
                        </p>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-sm font-semibold pointer-events-none rounded-full px-6"
                          tabIndex={-1}
                        >
                          {slide.accent} {slide.cta}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Navigation arrows */}
            <button
              onClick={(e) => { e.preventDefault(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
              aria-label="Slide trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
              aria-label="Slide sau"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.preventDefault(); setCurrent(index); }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === current
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/70"
                  )}
                  aria-label={`Chuyển đến slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right: 2 stacked banners */}
          <div className="hidden lg:flex flex-col gap-3 w-[320px] xl:w-[360px]">
            {sideBanners.map((banner, i) => (
              <Link
                key={i}
                href={banner.href}
                className="relative flex-1 rounded-xl overflow-hidden group/side block"
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/side:scale-105"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t",
                    banner.gradient
                  )}
                />
                {/* Decorative elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <span className="absolute top-3 right-4 text-white/20 text-2xl">{banner.accent}</span>
                  <span className="absolute top-1/2 right-8 text-white/10 text-3xl">{banner.accent}</span>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/[0.07] blur-xl" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-white/60 text-sm">{banner.accent}</span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-medium">GlowSkin</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold drop-shadow-md">
                    {banner.title}
                  </h3>
                  <p className="text-white/85 text-sm">{banner.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick link icons */}
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 gap-2">
          {quickLinks.map((item) => {
            const Icon = iconMap[item.iconName] || ShieldCheck;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1.5 rounded-xl py-3 hover:bg-primary-light/50 transition-colors group/link"
              >
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center group-hover/link:bg-primary group-hover/link:text-white transition-colors text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-muted-foreground font-medium group-hover/link:text-primary transition-colors">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
