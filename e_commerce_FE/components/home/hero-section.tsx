"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  badgeText?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  stats?: { value: string; label: string }[];
  imageUrl?: string;
  imageAlt?: string;
  backgroundColor?: string;
}

const defaultStats = [
  { value: "500+", label: "Sản phẩm" },
  { value: "50K+", label: "Khách hàng" },
  { value: "4.8", label: "Đánh giá" },
];

export function HeroSection({
  badgeText = "Bộ sưu tập Xuân Hè 2026",
  title = "Khám Phá",
  subtitle = "Vẻ Đẹp Toàn Diện",
  description = "Trải nghiệm các sản phẩm mỹ phẩm cao cấp, được tuyển chọn từ những thương hiệu hàng đầu thế giới. Chăm sóc làn da của bạn với những tinh chất tự nhiên nhất.",
  primaryCtaLabel = "Khám phá ngay",
  primaryCtaLink = "/products",
  secondaryCtaLabel = "Chăm sóc da",
  secondaryCtaLink = "/category/cham-soc-da",
  stats = defaultStats,
  imageUrl = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&h=1000&fit=max&q=90",
  imageAlt = "Mỹ phẩm cao cấp GlowSkin",
  backgroundColor,
}: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-primary-light via-background to-secondary/30"
      style={backgroundColor ? { backgroundColor, backgroundImage: "none" } : undefined}
    >
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>{badgeText}</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
              {title}
              <span className="text-primary block">{subtitle}</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 text-pretty">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-base px-8">
                <Link href={primaryCtaLink}>
                  {primaryCtaLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 bg-transparent">
                <Link href={secondaryCtaLink}>{secondaryCtaLabel}</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10 justify-center lg:justify-start">
              {stats.map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-square max-w-md mx-auto lg:max-w-none">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/40 rounded-[3rem] transform rotate-3 shadow-inner"></div>

              <div className="relative h-full rounded-[2.5rem] overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-700 bg-white/40 backdrop-blur-sm p-1">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover rounded-[2.2rem]"
                  priority
                />
              </div>

              {/* Floating cards */}
              <div className="absolute -left-4 top-1/4 bg-white rounded-xl shadow-lg p-4 animate-bounce-slow hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <span className="text-success text-lg">100%</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Chính hãng</p>
                    <p className="text-xs text-muted-foreground">Cam kết chất lượng</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-lg p-4 animate-bounce-slow hidden md:block" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-lg">Free</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Miễn phí ship</p>
                    <p className="text-xs text-muted-foreground">Đơn từ 500K</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
    </section>
  );
}
