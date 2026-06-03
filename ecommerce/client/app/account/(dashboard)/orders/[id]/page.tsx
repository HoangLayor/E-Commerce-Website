"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ChevronLeft,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  MapPin,
  CreditCard,
  ShoppingBag,
  History,
  Star,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/data";
import { fetchMyOrderDetail, cancelMyOrder, requestRefund, type OrderResponse, slugify } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";
import { ReviewModal } from "@/components/reviews/review-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const orderId = Number(resolvedParams.id);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Cancellation Dialog State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [customCancellationReason, setCustomCancellationReason] = useState("");

  const CANCELLATION_OPTIONS = [
    { id: "change_mind", label: "Thay đổi ý định mua hàng / Không còn nhu cầu" },
    { id: "wrong_address", label: "Nhập sai địa chỉ giao hàng hoặc số điện thoại" },
    { id: "wrong_product", label: "Muốn thay đổi sản phẩm/phân loại hoặc số lượng" },
    { id: "better_price", label: "Tìm thấy giá rẻ hơn ở cửa hàng khác" },
    { id: "too_long", label: "Thời gian giao hàng dự kiến quá lâu" },
    { id: "other", label: "Lý do khác (Vui lòng ghi rõ bên dưới)" },
  ];

  // Refund Dialog State
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundBank, setRefundBank] = useState("");
  const [refundAccountNo, setRefundAccountNo] = useState("");
  const [refundAccountName, setRefundAccountName] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: number;
    name: string;
    image: string;
    variant?: string;
  } | null>(null);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setIsLoading(true);
      const data = await fetchMyOrderDetail(orderId);
      setOrder(data);
    } catch (error) {
      toast.error("Không thể tải thông tin đơn hàng");
      router.push("/account/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelDialogOpen(true);
  };

  const submitCancelOrder = async () => {
    let reason = cancellationReason;
    if (reason.includes("Lý do khác")) {
      if (!customCancellationReason.trim()) {
        toast.error("Vui lòng ghi rõ lý do khác!");
        return;
      }
      reason = `Khác: ${customCancellationReason.trim()}`;
    }

    setIsCancelling(true);
    try {
      await cancelMyOrder(orderId, reason);
      toast.success("Đã hủy đơn hàng thành công");
      setCancelDialogOpen(false);
      loadOrderDetail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hủy đơn hàng thất bại");
    } finally {
      setIsCancelling(false);
    }
  };

  const submitRefundRequest = async () => {
    const trimmedReason = refundReason.trim();
    const trimmedBank = refundBank.trim();
    const trimmedAccountNo = refundAccountNo.trim();
    const trimmedAccountName = refundAccountName.trim();

    if (!trimmedReason || !trimmedBank || !trimmedAccountNo || !trimmedAccountName) {
      toast.error("Vui lòng điền đầy đủ thông tin hoàn tiền");
      return;
    }

    if (trimmedReason.length < 10) {
      toast.error("Lý do hoàn tiền phải có ít nhất 10 ký tự");
      return;
    }

    if (trimmedBank.length < 2) {
      toast.error("Tên ngân hàng không hợp lệ");
      return;
    }

    if (!/^\d{6,20}$/.test(trimmedAccountNo)) {
      toast.error("Số tài khoản phải là chữ số và dài từ 6 đến 20 ký tự");
      return;
    }

    if (!/^[A-Z\s]{3,50}$/.test(trimmedAccountName)) {
      toast.error("Tên chủ tài khoản phải viết hoa không dấu (ví dụ: NGUYEN VAN A) và dài từ 3 đến 50 ký tự");
      return;
    }

    const accountInfo = `Ngân hàng: ${trimmedBank}\nSTK: ${trimmedAccountNo}\nChủ TK: ${trimmedAccountName}`;

    setIsRefunding(true);
    try {
      await requestRefund(orderId, trimmedReason, accountInfo);
      toast.success("Đã gửi yêu cầu hoàn tiền thành công");
      setRefundDialogOpen(false);
      loadOrderDetail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gửi yêu cầu thất bại");
    } finally {
      setIsRefunding(false);
    }
  };

  const openReviewModal = (item: any) => {
    setSelectedItem({
      id: item.id,
      name: item.productName,
      image: item.imageUrl,
      variant: item.variantName,
    });
    setReviewModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) return null;

  const getStatusInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
      case "PROCESSING":
        return { label: "Đang xử lý", color: "bg-warning/10 text-warning border-warning/20", icon: <Clock className="h-4 w-4" /> };
      case "CONFIRMED":
        return { label: "Đã xác nhận", color: "bg-info/10 text-info border-info/20", icon: <CheckCircle2 className="h-4 w-4" /> };
      case "SHIPPED":
        return { label: "Đã giao hàng", color: "bg-info/10 text-info border-info/20", icon: <CheckCircle2 className="h-4 w-4" /> };
      case "SHIPPING":
        return { label: "Đang giao hàng", color: "bg-primary/10 text-primary border-primary/20", icon: <Truck className="h-4 w-4" /> };
      case "DELIVERED":
        return { label: "Đã giao hàng thành công", color: "bg-success/10 text-success border-success/20", icon: <CheckCircle2 className="h-4 w-4" /> };
      case "CANCELLED":
        return { label: "Đã hủy", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <XCircle className="h-4 w-4" /> };
      case "FAILED_DELIVERY":
        return { label: "Giao hàng thất bại", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <AlertCircle className="h-4 w-4" /> };
      case "REFUNDED":
        return { label: "Đã hoàn tiền", color: "bg-muted text-muted-foreground border-muted", icon: <CheckCircle2 className="h-4 w-4" /> };
      default:
        return { label: status, color: "bg-muted text-muted-foreground", icon: <AlertCircle className="h-4 w-4" /> };
    }
  };

  const status = getStatusInfo(order.orderStatus);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/50 bg-white">
            <Link href="/account/orders">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h1>
              <Badge variant="outline" className={`rounded-full px-3 py-1 font-bold flex items-center gap-1.5 ${status.color}`}>
                {status.icon}
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              Ngày đặt: {new Date(order.orderDate).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {order.orderStatus.toUpperCase() === "PENDING" && (
          <Button
            variant="destructive"
            size="sm"
            className="rounded-full px-6 shadow-lg shadow-destructive/10"
            onClick={handleCancelOrder}
            disabled={isCancelling}
          >
            {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
            Hủy đơn hàng
          </Button>
        )}
      </div>

      {/* Failed Delivery Notice / Refund Section */}
      {order.orderStatus.toUpperCase() === "REFUNDED" && order.isRefundRequested && (
        <div className="w-full">
          <div className="p-4 rounded-xl border border-green-200 bg-green-50 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
              Yêu cầu hoàn tiền đã hoàn tất
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
              <div className="text-sm space-y-2 flex-1">
                <p><span className="font-semibold text-muted-foreground">Số tiền đã hoàn:</span> {formatPrice(order.totalPrice)}</p>
                <p><span className="font-semibold text-muted-foreground">Tài khoản thụ hưởng:</span> {order.refundAccountInfo}</p>
                <p className="text-xs text-green-600/80 mt-2">Chúng tôi đã tiến hành hoàn tiền thành công vào tài khoản của bạn. Vui lòng kiểm tra số dư.</p>
              </div>
              {order.refundAttachmentUrl && (
                <div className="w-full md:w-48 shrink-0 space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground block">ẢNH XÁC NHẬN CHUYỂN TIỀN:</span>
                  <div className="relative rounded-lg overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all">
                    <img 
                      src={order.refundAttachmentUrl} 
                      alt="Ảnh xác nhận hoàn tiền" 
                      className="w-full max-h-40 object-contain mx-auto cursor-zoom-in"
                      onClick={() => {
                        window.open(order.refundAttachmentUrl, "_blank");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {order.orderStatus.toUpperCase() === "FAILED_DELIVERY" && (
        <div className="w-full">
          {order.paymentStatus.toUpperCase() !== "PAID" ? (
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-destructive font-bold">
                <AlertCircle className="h-5 w-5" />
                Đơn hàng giao thất bại
              </div>
              <p className="text-sm text-muted-foreground">
                Đơn hàng của bạn chưa được giao thành công. Do đơn hàng này chưa được thanh toán trước (hoặc là đơn COD), bạn không cần gửi yêu cầu hoàn tiền.
              </p>
            </div>
          ) : order.isRefundRequested ? (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600 font-bold">
                <AlertCircle className="h-5 w-5" />
                Đã gửi yêu cầu hoàn tiền
              </div>
              <div className="text-sm space-y-2">
                <p><span className="font-semibold text-muted-foreground">Lý do không nhận:</span> {order.refundReason}</p>
                <div>
                  <span className="font-semibold text-muted-foreground">Thông tin tài khoản:</span> 
                  <p className="bg-white p-2 mt-1 rounded border whitespace-pre-wrap">{order.refundAccountInfo}</p>
                </div>
                <p className="text-xs text-amber-600/80 mt-2">Vui lòng chờ chúng tôi xử lý yêu cầu hoàn tiền của bạn.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3 flex flex-col sm:flex-row items-center justify-between shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-destructive font-bold">
                  <AlertCircle className="h-5 w-5" />
                  Đơn hàng giao thất bại
                </div>
                <p className="text-sm text-muted-foreground">
                  Đơn hàng của bạn chưa được giao thành công. Vui lòng gửi yêu cầu hoàn tiền.
                </p>
              </div>
              <Button 
                onClick={() => setRefundDialogOpen(true)}
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20 rounded-full shrink-0"
              >
                Yêu cầu hoàn tiền
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Products List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Sản phẩm đã đặt ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {order.items?.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/product/${slugify(item.productName)}-${item.productId}`}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/10 transition-colors group"
                  >
                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border/50 shadow-sm group-hover:scale-105 transition-transform">
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {item.productName}
                      </h4>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary-light"></span>
                          Phân loại: {item.variantName}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                          <p className="text-xs text-muted-foreground">Số lượng: x{item.quantity}</p>
                        </div>
                        <p className="font-bold text-base">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>

                    {order.orderStatus.toUpperCase() === "DELIVERED" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full gap-2 px-4 border border-primary/20 hover:bg-primary hover:text-white transition-all sm:self-center"
                        onClick={() => openReviewModal(item)}
                      >
                        <Star className="h-4 w-4" />
                        Đánh giá
                      </Button>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline / Status History Block */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-lg flex items-center gap-2 text-info">
                <History className="h-5 w-5" />
                Lịch sử đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                <div className="relative">
                  <div className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white ring-4 ring-primary-light ${order.orderStatus.toUpperCase() !== 'CANCELLED' ? 'bg-primary' : 'bg-muted'}`}></div>
                  <p className="text-sm font-bold">Đặt hàng thành công</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleString("vi-VN")}</p>
                </div>
                {order.orderStatus.toUpperCase() === "CANCELLED" ? (
                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white ring-4 ring-destructive/20 bg-destructive"></div>
                    <p className="text-sm font-bold text-destructive">Đơn hàng đã hủy</p>
                    {order.cancelReason && (
                      <p className="text-xs text-muted-foreground mt-1 font-medium bg-destructive/5 px-2 py-1 rounded border border-destructive/10 inline-block">
                        Lý do: {order.cancelReason}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white ring-4 ${['DELIVERED', 'SHIPPING', 'SHIPPED', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus.toUpperCase()) ? 'ring-primary-light bg-primary' : 'ring-muted bg-muted/50'}`}></div>
                      <p className={`text-sm font-bold ${['DELIVERED', 'SHIPPING', 'SHIPPED', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus.toUpperCase()) ? '' : 'text-muted-foreground'}`}>Người bán đã xác nhận đơn hàng</p>
                    </div>
                    <div className="relative">
                      <div className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white ring-4 ${['DELIVERED', 'SHIPPING', 'SHIPPED'].includes(order.orderStatus.toUpperCase()) ? 'ring-primary-light bg-primary' : 'ring-muted bg-muted/50'}`}></div>
                      <p className={`text-sm font-bold ${['DELIVERED', 'SHIPPING', 'SHIPPED'].includes(order.orderStatus.toUpperCase()) ? '' : 'text-muted-foreground'}`}>Đơn hàng đang trên đường vận chuyển</p>
                    </div>
                    <div className="relative">
                      <div className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white ring-4 ${order.orderStatus.toUpperCase() === 'DELIVERED' ? 'ring-success-light bg-success' : 'ring-muted bg-muted/50'}`}></div>
                      <p className={`text-sm font-bold ${order.orderStatus.toUpperCase() === 'DELIVERED' ? 'text-success' : 'text-muted-foreground'}`}>Giao hàng thành công</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Address & Payment & Summary */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-white to-muted/20">
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Địa chỉ nhận hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-bold text-sm uppercase tracking-tight">{order.receiverName}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{order.phone}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {order.shippingAddress}
              </p>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Phương thức:</span>
                <span className="font-medium">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến (VNPay)'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge variant="outline" className={order.paymentStatus.toUpperCase() === 'PAID' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                  {order.paymentStatus.toUpperCase() === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-border/50 shadow-sm bg-white border-2 border-primary/10">
            <CardHeader className="py-4">
              <CardTitle className="text-base">Tổng kết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="font-medium">{formatPrice((order.totalPrice || 0) + (order.discountAmount || 0) - (order.shippingFee || 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển:</span>
                <span className={order.shippingFee && order.shippingFee > 0 ? "font-medium" : "font-medium text-success"}>
                  {order.shippingFee && order.shippingFee > 0 ? `+${formatPrice(order.shippingFee)}` : "Miễn phí"}
                </span>
              </div>
              {order.voucherCode && (
                <div className="flex justify-between text-sm text-destructive font-medium">
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Khuyến mãi ({order.voucherCode}):
                  </span>
                  <span>-{formatPrice(order.discountAmount || 0)}</span>
                </div>
              )}
              <Separator className="my-2 bg-primary/10" />
              <div className="flex justify-between items-end">
                <span className="font-bold">Tổng thanh toán:</span>
                <span className="text-2xl font-bold text-primary tracking-tight">{formatPrice(order.totalPrice)}</span>
              </div>
            </CardContent>
            {order.paymentUrl && order.paymentStatus.toUpperCase() !== 'PAID' && order.orderStatus.toUpperCase() !== 'CANCELLED' && (
              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-info hover:bg-info-hover rounded-full shadow-lg shadow-info/20 font-bold" asChild>
                  <a href={order.paymentUrl}>Thanh toán ngay</a>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          orderItemId={selectedItem.id}
          productName={selectedItem.name}
          productImage={selectedItem.image}
          variantName={selectedItem.variant}
        />
      )}

      {/* Cancel Order Modal */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
          <DialogHeader className="bg-destructive/5 -mx-6 -mt-6 p-6 border-b border-destructive/10">
            <DialogTitle className="text-xl font-bold font-serif text-destructive flex items-center gap-2">
              <XCircle className="h-6 w-6" />
              Hủy đơn hàng #{order.id}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Vui lòng chọn lý do hủy đơn hàng của bạn. Điều này giúp chúng tôi cải thiện dịch vụ tốt hơn.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <RadioGroup value={cancellationReason} onValueChange={setCancellationReason} className="space-y-3">
              {CANCELLATION_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center gap-3 space-x-2">
                  <RadioGroupItem value={option.label} id={option.id} className="border-muted hover:border-destructive" />
                  <Label htmlFor={option.id} className="text-sm font-medium cursor-pointer leading-none text-foreground hover:text-destructive transition-colors">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {cancellationReason.includes("Lý do khác") && (
              <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="custom-reason" className="text-sm font-bold text-muted-foreground">Chi tiết lý do khác:</Label>
                <Textarea
                  id="custom-reason"
                  placeholder="Vui lòng nhập lý do cụ thể..."
                  className="resize-none h-20 rounded-xl focus-visible:ring-destructive/20 border-border/50 bg-muted/20"
                  value={customCancellationReason}
                  onChange={(e) => setCustomCancellationReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50 -mx-6 -mb-6 p-6 bg-muted/20">
            <Button variant="ghost" onClick={() => setCancelDialogOpen(false)} className="rounded-full flex-1 hover:bg-muted-hover">
              Đóng
            </Button>
            <Button
              onClick={submitCancelOrder}
              disabled={isCancelling || !cancellationReason || (cancellationReason.includes("Lý do khác") && !customCancellationReason.trim())}
              className="rounded-full flex-1 bg-destructive hover:bg-destructive-hover shadow-lg shadow-destructive/20 text-white font-bold transition-all"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận hủy đơn"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-2xl border-none shadow-2xl bg-white">
          <DialogHeader className="bg-destructive/5 -mx-6 -mt-6 p-6 border-b border-destructive/10">
            <DialogTitle className="text-xl font-bold font-serif text-destructive flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Yêu cầu hoàn tiền đơn hàng #{order.id}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Vui lòng cung cấp lý do không nhận được hàng và thông tin tài khoản để chúng tôi hoàn tiền.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refund-reason" className="text-sm font-bold text-muted-foreground">Lý do không nhận hàng <span className="text-destructive">*</span></Label>
              <Textarea
                id="refund-reason"
                placeholder="Ví dụ: Đã đợi quá lâu, không gọi được shipper..."
                className="resize-none h-20 rounded-xl focus-visible:ring-destructive/20 border-border/50 bg-muted/20"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
            
            <div className="space-y-3 border-t border-border/50 pt-4">
              <Label className="text-sm font-bold text-muted-foreground">Thông tin tài khoản nhận tiền <span className="text-destructive">*</span></Label>
              <div className="space-y-2">
                <Input
                  placeholder="Tên ngân hàng (Vd: Vietcombank)"
                  className="rounded-lg focus-visible:ring-destructive/20"
                  value={refundBank}
                  onChange={(e) => setRefundBank(e.target.value)}
                />
                <Input
                  placeholder="Số tài khoản"
                  className="rounded-lg focus-visible:ring-destructive/20"
                  value={refundAccountNo}
                  onChange={(e) => setRefundAccountNo(e.target.value.replace(/\D/g, ""))}
                />
                <Input
                  placeholder="Tên chủ tài khoản (Viết hoa không dấu)"
                  className="rounded-lg focus-visible:ring-destructive/20 uppercase"
                  value={refundAccountName}
                  onChange={(e) => setRefundAccountName(e.target.value.toUpperCase().replace(/[^A-Z\s]/g, ""))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50 -mx-6 -mb-6 p-6 bg-muted/20">
            <Button variant="ghost" onClick={() => setRefundDialogOpen(false)} className="rounded-full flex-1 hover:bg-muted-hover">
              Đóng
            </Button>
            <Button
              onClick={submitRefundRequest}
              disabled={isRefunding || !refundReason.trim() || !refundBank.trim() || !refundAccountNo.trim() || !refundAccountName.trim()}
              className="rounded-full flex-1 bg-destructive hover:bg-destructive-hover shadow-lg shadow-destructive/20 text-white font-bold transition-all"
            >
              {isRefunding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Gửi yêu cầu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
