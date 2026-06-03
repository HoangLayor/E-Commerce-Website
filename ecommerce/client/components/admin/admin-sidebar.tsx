"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut,
  Layers,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { name: "Sản phẩm", href: "/admin/products", icon: Package },
  { name: "Danh mục", href: "/admin/categories", icon: Tag },
  { name: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  { name: "Khách hàng", href: "/admin/customers", icon: Users },
  { name: "Voucher", href: "/admin/vouchers", icon: Tag },
  { name: "Flash Sale", href: "/admin/promotions/flash-sale", icon: Sparkles },
  { name: "Tự động hóa AI", href: "/admin/automation", icon: Cpu },
  { name: "Báo cáo", href: "/admin/reports", icon: BarChart3 },
  { name: "Giao diện", href: "/admin/pages", icon: Layers },
  { name: "Cài đặt", href: "/admin/settings", icon: Settings },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-serif text-xl font-bold text-foreground">
          GlowSkin
        </span>
        <span className="ml-auto rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-gradient-to-r from-background to-primary-light/20 px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent onLinkClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-serif text-lg font-bold">GlowSkin Admin</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-border bg-gradient-to-b from-card via-card to-primary-light/15 lg:block">
        <SidebarContent />
      </div>
    </>
  );
}
