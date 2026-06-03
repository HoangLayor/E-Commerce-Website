"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles, Gift, Check, Truck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { formatPrice } from "@/lib/data";
import { useCart } from "@/contexts/cart-context";
import { fetchPublicVouchers, applyVoucher as apiApplyVoucher, type Voucher, type VoucherApplyResponse } from "@/lib/api";
import { useEffect } from "react";

export function CartContent() {
  const { cartItems, isLoading, removeItem, updateQuantity } = useCart();
  const [authRequired, setAuthRequired] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);
  const [appliedVoucherResult, setAppliedVoucherResult] = useState<VoucherApplyResponse | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const data = await fetchPublicVouchers();
        setVouchers(data.filter((v: Voucher) => v.isActive));
      } catch (error) {
        console.error("Failed to fetch vouchers:", error);
      }
    };
    loadVouchers();
  }, []);

  const handleApplyCoupon = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsApplyingVoucher(true);
    try {
      const result = await apiApplyVoucher({
        code: code,
        orderAmount: subtotal
      });
      setAppliedVoucherResult(result);
      const voucher = vouchers.find(v => v.code === result.code);
      if (voucher) setSelectedVoucher(voucher);
      toast.success(result.message);
      setVoucherCode("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mã giảm giá không hợp lệ";
      toast.error(message);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucherResult(null);
    setSelectedVoucher(null);
    toast.success("Đã xóa mã giảm giá");
  };

  const subtotal = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };
  const discount = appliedVoucherResult?.discountAmount || 0;
  const isFreeShippingPromo = appliedVoucherResult?.type === "SHIPPING";
  const shipping = (subtotal >= 500000 || isFreeShippingPromo) ? 0 : 30000;
  const total = subtotal - discount + shipping;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (authRequired) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-serif text-2xl font-bold mb-4">Vui lòng đăng nhập để xem giỏ hàng</h1>
          <p className="text-muted-foreground mb-8">Giỏ hàng được đồng bộ theo tài khoản của bạn trên hệ thống.</p>
          <Button asChild size="lg">
            <Link href="/account/login">Đăng nhập ngay</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-serif text-2xl font-bold mb-4">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="text-muted-foreground mb-8">
            Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và thêm vào giỏ hàng.
          </p>
          <Button asChild size="lg">
            <Link href="/products">
              Tiếp tục mua sắm
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-background via-primary-light/8 to-secondary/8">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Giỏ hàng</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2 p-2">
              <Checkbox
                id="select-all"
                checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                onCheckedChange={toggleAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Chọn tất cả ({cartItems.length} sản phẩm)
              </label>
            </div>
            {cartItems.map((item) => (
              <Card key={item.id} className={selectedItems.includes(item.id) ? "border-primary/30 ring-1 ring-primary/10" : ""}>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    {/* Product Image */}
                    <Link
                      href={item.slug ? `/product/${item.slug}` : "/products"}
                      className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted"
                    >
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.slug ? `/product/${item.slug}` : "/products"}
                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.variantLabel}
                      </p>
                      <p className="text-primary font-semibold mt-2">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Continue Shopping */}
            <Button asChild variant="outline" className="w-full sm:w-auto bg-transparent">
              <Link href="/products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Tiếp tục mua sắm
              </Link>
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Voucher */}
                <div className="space-y-2">
                  <label className="text-sm font-medium mb-1 block">
                    Mã giảm giá
                  </label>
                  {appliedVoucherResult ? (
                    <div className="flex items-center justify-between bg-primary-light/20 p-3 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Badge className="bg-primary text-[10px] h-5">{appliedVoucherResult.code}</Badge>
                        <span className="text-[10px] text-muted-foreground truncate">Tiết kiệm {formatPrice(appliedVoucherResult.discountAmount)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveVoucher}
                        className="h-auto p-0 text-muted-foreground hover:text-destructive"
                      >
                        Xóa
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Nhập mã giảm giá"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                          className="pl-9"
                        />
                      </div>
                      <Button variant="outline" onClick={() => handleApplyCoupon()}>
                        Áp dụng
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="link"
                    onClick={() => setIsVoucherDialogOpen(true)}
                    className="text-xs text-primary h-auto p-0 flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    Chọn từ danh sách voucher
                  </Button>
                </div>

                <Separator />

                {/* Price Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Giảm giá
                      </span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-success">Miễn phí</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Miễn phí vận chuyển cho đơn hàng từ {formatPrice(500000)}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedItems.length === 0}
                  asChild={selectedItems.length > 0}
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
                    }
                  }}
                >
                  {selectedItems.length > 0 ? (
                    <Link href={`/checkout?items=${selectedItems.join(",")}`}>
                      Tiến hành thanh toán
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  ) : (
                    <>
                      Tiến hành thanh toán
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Bằng việc thanh toán, bạn đồng ý với{" "}
                  <Link href="/terms" className="underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  của chúng tôi.
                </p>
              </CardFooter>
            </Card>

            {/* Voucher Selection Dialog */}
            <Dialog open={isVoucherDialogOpen} onOpenChange={setIsVoucherDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif">Voucher dành cho bạn</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {vouchers.length === 0 ? (
                    <div className="py-10 text-center space-y-3">
                      <Gift className="h-10 w-10 mx-auto text-muted-foreground opacity-20" />
                      <p className="text-sm text-muted-foreground">Hiện chưa có voucher nào khả dụng.</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/vouchers">Xem danh sách voucher</Link>
                      </Button>
                    </div>
                  ) : (
                    vouchers.map((voucher) => {
                      const isEligible = subtotal >= (voucher.minOrderValue || 0);
                      const isSelected = selectedVoucher?.id === voucher.id;
                      return (
                        <div
                          key={voucher.id}
                          onClick={() => {
                            if (isEligible) {
                              handleApplyCoupon(voucher.code);
                              setIsVoucherDialogOpen(false);
                            }
                          }}
                          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer group ${isSelected
                            ? "border-primary bg-primary-light/10"
                            : isEligible
                              ? "border-muted hover:border-primary/50"
                              : "opacity-50 grayscale cursor-not-allowed"
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${voucher.type === 'SHIPPING' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'
                              }`}>
                              {voucher.type === 'SHIPPING' ? <Truck className="h-6 w-6" /> : <Gift className="h-6 w-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm">{voucher.code}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">HSD: {new Date(voucher.expiryDate).toLocaleDateString("vi-VN")}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-[10px] py-0">{
                                  voucher.type === 'PERCENT' ? `Giảm ${voucher.value}%` :
                                    voucher.type === 'FIXED' ? `Giảm ${formatPrice(voucher.value)}` : 'Free Ship'
                                }</Badge>
                                {!isEligible && (
                                  <span className="text-[10px] text-rose-500 font-medium">
                                    Thêm {formatPrice((voucher.minOrderValue || 0) - subtotal)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
