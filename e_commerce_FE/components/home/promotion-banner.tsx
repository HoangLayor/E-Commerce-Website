"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Clock, Zap, Gift, Percent } from "lucide-react";

interface PromotionBannerProps {
  type?: "flash-sale" | "seasonal" | "coupon" | "new-arrival";
}

export function PromotionBanner({ type = "flash-sale" }: PromotionBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  if (type === "flash-sale") {
    return (
      <div className="relative bg-gradient-to-r from-primary via-primary-hover to-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjEiIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 animate-pulse" />
              <span className="font-bold text-sm md:text-base">FLASH SALE</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div className="flex items-center gap-1 font-mono font-bold">
                <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            
            <span className="text-sm md:text-base">Giảm đến 50% tất cả sản phẩm</span>
            
            <Button asChild size="sm" variant="secondary" className="font-medium">
              <Link href="/products?sale=true">Mua ngay</Link>
            </Button>
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-foreground/80 hover:text-primary-foreground p-1"
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (type === "coupon") {
    return (
      <div className="relative bg-gradient-to-r from-secondary via-secondary to-primary-light">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Gift className="h-5 w-5 text-primary" />
            <span className="font-medium text-secondary-foreground">
              Nhập mã <span className="font-bold text-primary bg-white px-2 py-0.5 rounded">GLOW10</span> giảm 10% cho voucher đầu tiên
            </span>
            <Button asChild size="sm" className="font-medium">
              <Link href="/products">Dùng ngay</Link>
            </Button>
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-foreground/80 hover:text-secondary-foreground p-1"
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return null;
}

// Large promotional section for homepage
export function PromotionalSection() {
  return (
    <section className="py-10 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Main promo */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-10 flex flex-col justify-between min-h-[350px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Percent className="h-4 w-4" />
                Ưu đãi đặc biệt
              </span>
              <h3 className="font-serif text-3xl md:text-4xl font-bold mb-3">
                Giảm 30%
                <br />
                <span className="text-primary">Bộ Skincare</span>
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Combo chăm sóc da toàn diện gồm serum, kem dưỡng và kem chống nắng với giá ưu đãi.
              </p>
            </div>
            <Button asChild size="lg" className="self-start">
              <Link href="/products?category=skincare&sale=true">
                Khám phá combo
              </Link>
            </Button>
          </div>

          {/* Secondary promos */}
          <div className="grid gap-6">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-secondary/50 p-6 md:p-8">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <span className="text-sm font-medium text-secondary-foreground/80 mb-2 block">Mới về</span>
                  <h4 className="font-serif text-xl md:text-2xl font-bold mb-2">Bộ Sưu Tập Son Xuân</h4>
                  <p className="text-sm text-secondary-foreground/80 mb-4">12 màu son hot nhất 2026</p>
                  <Button asChild variant="outline" size="sm" className="bg-transparent border-secondary-foreground/30 hover:bg-secondary-foreground/10">
                    <Link href="/products?category=makeup">Xem ngay</Link>
                  </Button>
                </div>
                <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&h=200&fit=crop"
                    alt="Bộ sưu tập son"
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-light to-accent p-6 md:p-8">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <span className="text-sm font-medium text-accent-foreground/80 mb-2 block">Thành viên mới</span>
                  <h4 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-2">Nhận voucher 100K</h4>
                  <p className="text-sm text-muted-foreground mb-4">Đăng ký thành viên ngay hôm nay</p>
                  <Button asChild size="sm">
                    <Link href="/account/login">Đăng ký ngay</Link>
                  </Button>
                </div>
                <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                    <Gift className="h-12 w-12 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
