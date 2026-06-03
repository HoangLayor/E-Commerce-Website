"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Heart,
  Tag,
  Star,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchUserProfile, logoutUser } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const menuItems = [
  { name: "Tổng quan", href: "/account", icon: User },
  { name: "Đơn hàng của tôi", href: "/account/orders", icon: Package },
  { name: "Sổ địa chỉ", href: "/account/addresses", icon: MapPin },
  { name: "Yêu thích", href: "/account/wishlist", icon: Heart },
  { name: "Voucher của tôi", href: "/account/vouchers", icon: Tag },
  { name: "Đánh giá của tôi", href: "/account/reviews", icon: Star },
  { name: "Cài đặt", href: "/account/settings", icon: Settings },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setUserData(profile);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Đã đăng xuất thành công");
      router.push("/account/login");
      router.refresh();
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    }
  };

  if (isLoading) {
    return (
      <Card className="sticky top-24">
        <CardContent className="p-6 flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Fallback for when profile fetch fails or not logged in
  const userDisplay = userData ? {
    name: userData.name,
    email: userData.email,
    avatar: "/placeholder.svg",
    role: userData.role || "USER"
  } : {
    name: "Khách",
    email: "",
    avatar: "/placeholder.svg",
    role: "USER"
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        {/* User Profile */}
        <div className="text-center mb-6 pb-6 border-b border-border">
          <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 bg-muted">
            <Image
              src={userDisplay.avatar || "/placeholder.svg"}
              alt={userDisplay.name || "User Avatar"}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <h3 className="font-semibold">{userDisplay.name}</h3>
          <p className="text-sm text-muted-foreground">{userDisplay.email}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge className="bg-warning/10 text-warning border-warning/20">
              {userDisplay.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-6 pt-6 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Đăng xuất
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
