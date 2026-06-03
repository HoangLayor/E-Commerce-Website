"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/data";
import { fetchMyOrders, type OrderResponse, createVNPayPayment } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
      case "PROCESSING":
        return { label: "Đang xử lý", color: "bg-warning/10 text-warning" };
      case "CONFIRMED":
        return { label: "Đã xác nhận", color: "bg-info/10 text-info" };
      case "SHIPPING":
      case "SHIPPED":
        return { label: "Đang giao", color: "bg-primary/10 text-primary" };
      case "DELIVERED":
        return { label: "Đã giao", color: "bg-success/10 text-success" };
      case "CANCELLED":
        return { label: "Đã hủy", color: "bg-destructive/10 text-destructive" };
      case "FAILED_DELIVERY":
        return { label: "Giao hàng thất bại", color: "bg-destructive/10 text-destructive" };
      case "REFUNDED":
        return { label: "Đã hoàn tiền", color: "bg-green-100 text-green-700" };
      default:
        return { label: status, color: "bg-muted text-muted-foreground" };
    }
  };

  const filterOrders = (status?: string) => {
    if (!status || status === "all") return orders;
    if (status === "shipping") {
        return orders.filter((order) => 
            order.orderStatus.toUpperCase() === "SHIPPING" || 
            order.orderStatus.toUpperCase() === "SHIPPED"
        );
    }
    if (status === "failed_delivery") {
        return orders.filter((order) => 
            order.orderStatus.toUpperCase() === "FAILED_DELIVERY"
        );
    }
    return orders.filter((order) => order.orderStatus.toUpperCase() === status.toUpperCase());
  };

  const OrderList = ({ filteredOrders }: { filteredOrders: OrderResponse[] }) => (
    <div className="space-y-4">
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Không có đơn hàng nào</p>
        </div>
      ) : (
        filteredOrders.map((order) => {
          const status = getStatusInfo(order.orderStatus);
          return (
            <div 
              key={order.id} 
              onClick={() => router.push(`/account/orders/${order.id}`)}
              className="block"
            >
              <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ring-1 ring-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={status.color}>{status.label}</Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items?.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.productName} {item.variantName ? `(${item.variantName})` : ""} x{item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 2 && (
                      <p className="text-sm text-muted-foreground">
                        +{(order.items?.length || 0) - 2} sản phẩm khác
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                    <div className="flex gap-2">
                        {order.orderStatus.toUpperCase() === "DELIVERED" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-xs gap-1 border-primary/20 hover:bg-primary/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/account/orders/${order.id}`);
                            }}
                          >
                            <Star className="h-3 w-3" />
                            Đánh giá
                          </Button>
                        )}
                      {order.orderStatus.toUpperCase() === "PENDING" && order.paymentUrl && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-xs text-info hover:text-info hover:bg-info/5"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = order.paymentUrl!;
                          }}
                        >
                          Tới trang thanh toán
                        </Button>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-xs block">Tổng cộng:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Đơn Hàng Của Tôi</h1>
        <p className="text-muted-foreground">
          Theo dõi và quản lý tất cả đơn hàng của bạn
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="all">Tất cả ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Chờ xử lý ({filterOrders("pending").length})
            </TabsTrigger>
            <TabsTrigger value="shipping">
              Đang giao ({filterOrders("shipping").length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Đã giao ({filterOrders("delivered").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Đã hủy ({filterOrders("cancelled").length})
            </TabsTrigger>
            <TabsTrigger value="failed_delivery">
              Thất bại ({filterOrders("failed_delivery").length})
            </TabsTrigger>
            <TabsTrigger value="refunded">
              Đã hoàn tiền ({filterOrders("refunded").length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <OrderList filteredOrders={filterOrders("all")} />
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            <OrderList filteredOrders={filterOrders("pending")} />
          </TabsContent>
          <TabsContent value="shipping" className="mt-6">
            <OrderList filteredOrders={filterOrders("shipping")} />
          </TabsContent>
          <TabsContent value="delivered" className="mt-6">
            <OrderList filteredOrders={filterOrders("delivered")} />
          </TabsContent>
          <TabsContent value="cancelled" className="mt-6">
            <OrderList filteredOrders={filterOrders("cancelled")} />
          </TabsContent>
          <TabsContent value="failed_delivery" className="mt-6">
            <OrderList filteredOrders={filterOrders("failed_delivery")} />
          </TabsContent>
          <TabsContent value="refunded" className="mt-6">
            <OrderList filteredOrders={filterOrders("refunded")} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
