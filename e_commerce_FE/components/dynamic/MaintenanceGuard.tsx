"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Hammer, Sparkles, Clock, ShieldAlert } from "lucide-react";
import { fetchSettings } from "@/lib/api";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkMaintenance() {
      // Bỏ qua kiểm tra hoàn toàn đối với các trang admin
      if (pathname.startsWith("/admin")) {
        setIsLoading(false);
        return;
      }

      try {
        const settings = await fetchSettings();
        const maintenanceSetting = settings.find(s => s.key === "maintenance_mode");
        if (maintenanceSetting && maintenanceSetting.value === "true") {
          setIsMaintenance(true);
        }
      } catch (err) {
        console.error("Failed to check maintenance mode:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkMaintenance();
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Đang tải cửa hàng...</p>
        </div>
      </div>
    );
  }

  if (isMaintenance) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-primary/5 to-secondary/10 px-4">
        <div className="relative max-w-md w-full bg-white/70 backdrop-blur-xl border border-primary/10 rounded-3xl p-8 text-center shadow-2xl overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/15 rounded-full blur-2xl" />

          {/* Icon */}
          <div className="relative mx-auto w-20 h-20 bg-gradient-to-tr from-primary to-rose-400 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
            <Hammer className="h-10 w-10 text-white animate-bounce" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-400 animate-pulse" />
          </div>

          {/* Text */}
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            Cửa hàng đang bảo trì ✿
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            GlowSkin Store đang tiến hành nâng cấp hệ thống để mang lại trải nghiệm mua sắm tuyệt vời nhất cho bạn. Chúng tôi sẽ quay trở lại trong thời gian sớm nhất!
          </p>

          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary/5 text-primary text-xs font-semibold w-fit mx-auto border border-primary/10">
            <Clock className="h-4 w-4" />
            <span>Vui lòng quay lại sau ít phút</span>
          </div>

          <div className="mt-8 border-t border-border/80 pt-6">
            <p className="text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-1.5 uppercase tracking-widest">
              <ShieldAlert className="h-3 w-3 text-primary" />
              Hệ thống quản lý GlowSkin
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
