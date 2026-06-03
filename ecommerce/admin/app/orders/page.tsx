"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Truck,
  XCircle,
  Download,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminFetchAllOrders, adminUpdateOrderStatus, adminExportOrdersExcel, type OrderResponse } from "@/lib/api";
import { toast } from "sonner";

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  PENDING: { label: "Chờ xử lý", variant: "outline" },
  PROCESSING: { label: "Đang xử lý", variant: "secondary" },
  SHIPPED: { label: "Đang giao", variant: "default" },
  DELIVERED: { label: "Đã giao", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
  FAILED_DELIVERY: { label: "Giao thất bại", variant: "destructive" },
  REFUNDED: { label: "Đã hoàn tiền", variant: "outline" },
};

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ thanh toán", color: "text-amber-600" },
  PAID: { label: "Đã thanh toán", color: "text-green-600" },
  REFUNDED: { label: "Đã hoàn tiền", color: "text-muted-foreground" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportOrders = async () => {
    try {
      setIsExporting(true);
      const blob = await adminExportOrdersExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Danh_sach_don_hang_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Xuất báo cáo đơn hàng thành công!");
    } catch (error) {
      toast.error("Lỗi khi xuất file Excel đơn hàng");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await adminFetchAllOrders();
      setOrders(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await adminUpdateOrderStatus({ id: orderId, status });
      toast.success(`Đã cập nhật trạng thái đơn hàng #${orderId}`);
      loadOrders();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      (order.receiverName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderCounts = {
    all: orders.length,
    PENDING: orders.filter((o) => o.orderStatus === "PENDING").length,
    PROCESSING: orders.filter((o) => o.orderStatus === "PROCESSING").length,
    SHIPPED: orders.filter((o) => o.orderStatus === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.orderStatus === "DELIVERED").length,
    CANCELLED: orders.filter((o) => o.orderStatus === "CANCELLED").length,
    FAILED_DELIVERY: orders.filter((o) => o.orderStatus === "FAILED_DELIVERY").length,
    REFUNDED: orders.filter((o) => o.orderStatus === "REFUNDED").length,
  };

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Đơn hàng
          </h1>
          <p className="text-muted-foreground">
            Quản lý và xử lý đơn hàng của khách từ hệ thống
          </p>
        </div>
        <Button variant="outline" onClick={handleExportOrders} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xuất...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Xuất báo cáo
            </>
          )}
        </Button>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">Tất cả ({orderCounts.all})</TabsTrigger>
          <TabsTrigger value="PENDING">
            Chờ xử lý ({orderCounts.PENDING})
          </TabsTrigger>
          <TabsTrigger value="PROCESSING">
            Đang xử lý ({orderCounts.PROCESSING})
          </TabsTrigger>
          <TabsTrigger value="SHIPPED">
            Đang giao ({orderCounts.SHIPPED})
          </TabsTrigger>
          <TabsTrigger value="DELIVERED">
            Đã giao ({orderCounts.DELIVERED})
          </TabsTrigger>
          <TabsTrigger value="CANCELLED">
            Đã hủy ({orderCounts.CANCELLED})
          </TabsTrigger>
          <TabsTrigger value="FAILED_DELIVERY">
            Thất bại ({orderCounts.FAILED_DELIVERY})
          </TabsTrigger>
          <TabsTrigger value="REFUNDED">
            Đã hoàn tiền ({orderCounts.REFUNDED})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hoặc tên khách..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                     <TableCell colSpan={7} className="text-center py-10">
                       <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                     </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Không tìm thấy đơn hàng nào.
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">
                      #{order.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.receiverName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[order.orderStatus]?.variant || "outline"}>
                        {statusMap[order.orderStatus]?.label || order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${paymentStatusMap[order.paymentStatus]?.color || "text-muted-foreground"}`}
                      >
                        {paymentStatusMap[order.paymentStatus]?.label || order.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </Link>
                          </DropdownMenuItem>
                          
                          {order.orderStatus === "PENDING" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "PROCESSING")}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                              Xác nhận đơn
                            </DropdownMenuItem>
                          )}

                          {order.orderStatus === "PROCESSING" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "SHIPPED")}>
                              <Truck className="mr-2 h-4 w-4 text-primary" />
                              Giao cho vận chuyển
                            </DropdownMenuItem>
                          )}

                          {order.orderStatus === "SHIPPED" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "DELIVERED")}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              Đã giao thành công
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          
                          {order.orderStatus !== "CANCELLED" &&
                            order.orderStatus !== "DELIVERED" && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Hủy đơn hàng
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Hiển thị {filteredOrders.length} đơn hàng</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button variant="outline" size="sm" disabled>
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
