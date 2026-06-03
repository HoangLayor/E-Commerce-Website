"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

// ============================================================
// CẤU HÌNH SỰ KIỆN - Thay đổi tại đây khi đổi sự kiện
// ============================================================
const EVENT_CONFIG = {
  // Tên sự kiện (dùng làm key lưu trạng thái đóng)
  id: "mung-8-3-2026",
  // Đường dẫn đến trang sự kiện
  href: "/events/mung-8-3",
  // Ảnh banner floating (90x90)
  image: "https://down-vn.img.susercontent.com/file/vn-11134258-81ztc-mlm3r3ldk9vkdc",
  // Alt text
  alt: "Ưu đãi Mùng 8/3 - GlowSkin",
  // Ngày kết thúc sự kiện (tự ẩn banner sau ngày này)
  endDate: new Date("2026-03-31T00:00:00"),
};
// ============================================================

export function FloatingBannerSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu sự kiện đã hết hạn
    if (new Date() > EVENT_CONFIG.endDate) return;

    // Kiểm tra nếu user đã đóng banner trong session này
    const dismissedKey = `floating_banner_dismissed_${EVENT_CONFIG.id}`;
    if (sessionStorage.getItem(dismissedKey) === "1") return;

    // Hiển thị sau 1 giây (tránh flash khi load trang)
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    const dismissedKey = `floating_banner_dismissed_${EVENT_CONFIG.id}`;
    sessionStorage.setItem(dismissedKey, "1");
  };

  if (!visible) return null;

  return (
    <section
      id="HomePageFloatingBannerSection"
      className="fixed bottom-20 right-2 sm:bottom-22 sm:right-4 md:right-4 z-40 animate-in slide-in-from-bottom-4 fade-in duration-500"
    >
      <div className="relative group">
        <Link
          href={EVENT_CONFIG.href}
          className="block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ring-2 ring-primary/20 hover:ring-primary/40"
        >
          <Image
            src={EVENT_CONFIG.image}
            alt={EVENT_CONFIG.alt}
            width={90}
            height={90}
            className="w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] md:w-[90px] md:h-[90px] object-cover"
            loading="lazy"
          />
        </Link>

        {/* Nút đóng */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-foreground/70 hover:bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
          aria-label="Đóng banner"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </section>
  );
}
