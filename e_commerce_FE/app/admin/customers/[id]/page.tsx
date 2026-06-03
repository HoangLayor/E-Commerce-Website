"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldOff,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Clock,
  ExternalLink,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminFetchUserById,
  adminFetchUserOrders,
  adminToggleUserStatus,
  type BackendUser,
  type OrderResponse,
} from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  PENDING: { label: "Chờ xử lý", variant: "outline" },
  PROCESSING: { label: "Đang xử lý", variant: "secondary" },
  SHIPPED: { label: "Đang giao", variant: "default" },
  DELIVERED: { label: "Đã giao", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function getInitials(name: string) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);
  
  const [user, setUser] = useState<BackendUser | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, ordersData] = await Promise.all([
          adminFetchUserById(id),
          adminFetchUserOrders(id),
        ]);
        setUser(userData);
        setOrders(ordersData);
      } catch (error) {
        toast.error("Không thể tải thông tin khách hàng");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setIsToggling(true);
    try {
      await adminToggleUserStatus(user.id, !user.isActive);
      const updatedUser = await adminFetchUserById(user.id);
      setUser(updatedUser);
      toast.success(user.isActive ? "Đã vô hiệu hóa tài khoản" : "Đã kích hoạt tài khoản");
    } catch (error) {
      toast.error("Thao tác thất bại");
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-medium">Không tìm thấy khách hàng</h2>
        <Button asChild>
          <Link href="/admin/customers">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Chi tiết khách hàng
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>#{user.id}</span>
              <span>•</span>
              <span>Gia nhập {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy") : "N/A"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={user.isActive ? "outline" : "default"} 
            className={user.isActive ? "text-destructive border-destructive hover:bg-destructive/10" : "bg-green-600 hover:bg-green-700"}
            onClick={handleToggleStatus}
            disabled={isToggling}
          >
            {user.isActive ? (
              <><ShieldOff className="mr-2 h-4 w-4" /> Vô hiệu hóa</>
            ) : (
              <><Shield className="mr-2 h-4 w-4" /> Kích hoạt tài khoản</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                <AvatarFallback className="text-2xl bg-primary-light text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1">
              <Badge variant={user.isActive ? "outline" : "destructive"} className={user.isActive ? "bg-green-50 text-green-700 border-green-200" : ""}>
                {user.isActive ? "Đang hoạt động" : "Bị khóa"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Số điện thoại</p>
                  <p className="font-medium">{user.phone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ngày tham gia</p>
                  <p className="font-medium">{user.createdAt ? format(new Date(user.createdAt), "dd MMMM, yyyy") : "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-primary">{user.orderCount || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success-light/30 border-success/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(user.totalSpent || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-100">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giá trị TB</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {formatCurrency(user.orderCount && user.orderCount > 0 ? (user.totalSpent || 0) / user.orderCount : 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Lịch sử mua hàng</CardTitle>
                <CardDescription>Danh sách đơn hàng đã đặt</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/orders">
                  Xem tất cả <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Ngày đặt</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          Khách hàng chưa có đơn hàng nào.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-bold">#{order.id}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {order.orderDate ? format(new Date(order.orderDate), "dd/MM/yyyy HH:mm") : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusMap[order.orderStatus]?.variant || "outline"}>
                              {statusMap[order.orderStatus]?.label || order.orderStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(order.totalPrice)}
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
