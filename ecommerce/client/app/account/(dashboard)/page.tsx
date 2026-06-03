"use client";

import Link from "next/link";
import { Package, MapPin, Heart, Tag, ArrowRight, Loader2, Clock, CheckCircle2, Truck, XCircle, AlertCircle, ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/data";
import { useEffect, useState } from "react";
import { fetchUserProfile, fetchMyOrders, fetchPublicVouchers, type OrderResponse, type Voucher, type UserProfileResponse } from "@/lib/api";
import Image from "next/image";

const quickActions = [
  { name: "Đơn hàng", href: "/account/orders", icon: Package, color: "bg-blue-500/10 text-blue-600" },
  { name: "Địa chỉ", href: "/account/addresses", icon: MapPin, color: "bg-emerald-500/10 text-emerald-600" },
  { name: "Yêu thích", href: "/account/wishlist", icon: Heart, color: "bg-rose-500/10 text-rose-600" },
  { name: "Voucher", href: "/account/vouchers", icon: Tag, color: "bg-amber-500/10 text-amber-600" },
  { name: "Đánh giá", href: "/account/reviews", icon: Star, color: "bg-indigo-500/10 text-indigo-600" },
];

export default function AccountPage() {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, ordersData, vouchersData] = await Promise.all([
          fetchUserProfile(),
          fetchMyOrders(),
          fetchPublicVouchers(),
        ]);
        setUser(profile);
        setOrders(ordersData);
        setVouchers(vouchersData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || "bạn";
  const recentOrders = orders.slice(0, 3);
  const activeVouchersCount = vouchers.filter(v => v.isActive && new Date(v.expiryDate) > new Date()).length;
  const shippingOrdersCount = orders.filter(o => o.orderStatus === "SHIPPING" || o.orderStatus === "SHIPPED" || o.orderStatus === "CONFIRMED").length;

  const defaultAvatar = user?.gender === "male"
    ? "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&h=200&fit=crop"
    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop";

  const stats = [
    { label: "Tổng đơn hàng", value: orders.length, icon: Package, color: "text-blue-600" },
    { label: "Đang xử lý/giao", value: shippingOrdersCount, icon: Truck, color: "text-amber-600" },
    { label: "Voucher khả dụng", value: activeVouchersCount, icon: Tag, color: "text-emerald-600" },
    { label: "Hạng thành viên", value: orders.length >= 10 ? "Vàng" : orders.length >= 5 ? "Bạc" : "Đồng", icon: Heart, color: "text-rose-600" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": 
      case "PROCESSING": return <Clock className="h-4 w-4" />;
      case "CONFIRMED": return <CheckCircle2 className="h-4 w-4" />;
      case "SHIPPING":
      case "SHIPPED": return <Truck className="h-4 w-4" />;
      case "DELIVERED": return <CheckCircle2 className="h-4 w-4" />;
      case "CANCELLED": 
      case "FAILED_DELIVERY": return <XCircle className="h-4 w-4" />;
      case "REFUNDED": return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": 
      case "PROCESSING": return "bg-warning/10 text-warning border-warning/20";
      case "CONFIRMED": return "bg-info/10 text-info border-info/20";
      case "SHIPPING":
      case "SHIPPED": return "bg-primary/10 text-primary border-primary/20";
      case "DELIVERED": return "bg-success/10 text-success border-success/20";
      case "CANCELLED": 
      case "FAILED_DELIVERY": return "bg-destructive/10 text-destructive border-destructive/20";
      case "REFUNDED": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return "Chờ xử lý";
      case "PROCESSING": return "Đang xử lý";
      case "CONFIRMED": return "Đã xác nhận";
      case "SHIPPING":
      case "SHIPPED": return "Đang giao";
      case "DELIVERED": return "Đã giao";
      case "CANCELLED": return "Đã hủy";
      case "FAILED_DELIVERY": return "Giao thất bại";
      case "REFUNDED": return "Đã hoàn tiền";
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg shrink-0 relative flex items-center justify-center bg-muted">
            <Image
              src={user?.imageUrl || defaultAvatar}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">Xin chào, {displayName}!</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            {user?.gender && (
              <Badge variant="secondary" className="mt-1 text-[10px] h-5 px-2 rounded-full capitalize">
                {user.gender === "male" ? "Nam" : "Nữ"}
              </Badge>
            )}
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/account/settings">Chỉnh sửa hồ sơ</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={`p-3 rounded-xl mb-3 ${stat.color.replace('text-', 'bg-').split('-')[0]}-100/50`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Đơn hàng gần đây
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary-hover hover:bg-primary/5">
              <Link href="/account/orders" className="flex items-center gap-1">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`}>
                  <Card className="hover:border-primary/40 transition-all duration-300 group overflow-hidden border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                            <Package className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">Đơn hàng #{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="font-bold text-primary">{formatPrice(order.totalPrice)}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{order.paymentMethod}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)}
                            {getStatusLabel(order.orderStatus)}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Bạn chưa có đơn hàng nào.</p>
                  <Button asChild size="sm" className="mt-4 rounded-full">
                    <Link href="/products">Mua sắm ngay</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Menu */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Lối tắt</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="group">
                <Card className="border-border/50 h-full hover:border-primary/40 transition-all duration-300">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
                    <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{action.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Promotional Card */}
          <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white border-none overflow-hidden relative shadow-lg shadow-rose-500/20">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <CardContent className="p-6 relative z-10">
              <h3 className="font-bold mb-1">Mời bạn bè, nhận ưu đãi!</h3>
              <p className="text-xs text-white/80 mb-4 text-pretty">Nhận ngay voucher 50K cho mỗi lượt giới thiệu thành công sản phẩm từ GlowSkin.</p>
              <Button size="sm" className="w-full bg-white text-rose-600 hover:bg-white/90 rounded-full font-bold">
                Tìm hiểu thêm
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

