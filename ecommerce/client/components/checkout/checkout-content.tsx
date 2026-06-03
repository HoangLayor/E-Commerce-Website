"use client";

import React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CreditCard,
  MapPin,
  Truck,
  ChevronRight,
  ChevronLeft,
  Lock,
  ShieldCheck,
  Gift,
  Sparkles,
  Heart,
  Wallet,
  Banknote,
  Tag,
  Plus,
  Home,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatPrice, type Product } from "@/lib/data";
import {
  fetchCartItems,
  fetchProducts,
  fetchUserProfile,
  fetchPublicVouchers,
  checkout,
  createVNPayPayment,
  applyVoucher,
  fetchAddresses,
  addAddress,
  fetchMyOrders,
  triggerWebhook,
  fetchSettings,
  type Voucher,
  type VoucherApplyResponse,
  type AddressResponse,
  type AddressRequest
} from "@/lib/api";
import { useEffect } from "react";

const steps = [
  { id: 1, name: "Thông tin", icon: MapPin },
  { id: 2, name: "Vận chuyển", icon: Truck },
  { id: 3, name: "Thanh toán", icon: CreditCard },
];

const shippingMethods = [
  {
    id: "standard",
    name: "Giao hàng tiêu chuẩn",
    description: "3-5 ngày làm việc",
    price: 30000,
    icon: Truck,
  },
  {
    id: "express",
    name: "Giao hàng nhanh",
    description: "1-2 ngày làm việc",
    price: 50000,
    icon: Sparkles,
  },
  {
    id: "free",
    name: "Miễn phí vận chuyển",
    description: "3-5 ngày làm việc (Đơn từ 500K)",
    price: 0,
    minOrder: 500000,
    icon: Gift,
  },
];

const paymentMethods = [
  {
    id: "momo",
    name: "Ví MoMo",
    icon: Wallet,
    description: "Thanh toán qua ví điện tử MoMo",
  },
  {
    id: "vnpay",
    name: "VNPay",
    icon: CreditCard,
    description: "Thanh toán qua cổng VNPay",
  },
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)",
    icon: Banknote,
    description: "Trả tiền mặt khi nhận hàng",
  },
];

// Validation Helpers
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^(0|84)(3|5|7|8|9)([0-9]{8})$/.test(phone.replace(/\s/g, ""));
const isValidName = (name: string) => name.length >= 2 && name.length <= 50 && /^[\p{L}\s]+$/u.test(name);
const sanitizeInput = (val: string) => val.replace(/<[^>]*>/g, "").trim();

export function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedItemIds = searchParams.get("items")?.split(",") || [];

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    notes: "",
  });

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);
  const [appliedVoucherResult, setAppliedVoucherResult] = useState<VoucherApplyResponse | null>(null);
  const [userAddresses, setUserAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Add Address State
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = useState(false);
  const [newAddressData, setNewAddressData] = useState<AddressRequest>({
    receiverName: "",
    phone: "",
    address: "",
    isDefault: false
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const loadAddresses = async () => {
    try {
      const addrs = await fetchAddresses();
      setUserAddresses(addrs);
      return addrs;
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsResult, productsResult, profileResult, promoResult, addressResult, settingsResult] = await Promise.allSettled([
          fetchCartItems(),
          fetchProducts(),
          fetchUserProfile(),
          fetchPublicVouchers(),
          loadAddresses(),
          fetchSettings()
        ]);

        if (itemsResult.status === 'fulfilled' && productsResult.status === 'fulfilled') {
          const productMap = new Map<number, Product>(
            productsResult.value.map((p: any) => [Number(p.id), p])
          );

          const filteredItems = itemsResult.value
            .filter((item: any) => selectedItemIds.includes(String(item.id)))
            .map((item: any) => {
              // Rebuild variant label from attributeValues if present
              const attrs: Record<string, string> = {};
              if (item.attributeValues) {
                item.attributeValues.forEach((av: any) => {
                  attrs[av.name] = av.value;
                });
              }
              const variantLabel = Object.entries(attrs)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ") || item.sku || "Mặc định";

              // Normalize image URL
              const rawImg = item.variantImageUrl || item.thumbnail || "/placeholder.svg";
              const image = rawImg.startsWith("http") || rawImg.startsWith("/") 
                ? rawImg : `/${rawImg}`;

              return {
                id: String(item.id),
                productId: String(item.productId),
                name: item.productName,
                variant: variantLabel,
                image: image,
                price: Number(item.effectivePrice ?? item.price ?? 0),
                quantity: item.quantity,
              };
            });

          if (filteredItems.length === 0 && itemsResult.value.length > 0) {
            toast.error("Vui lòng chọn sản phẩm từ giỏ hàng để thanh toán");
            router.push("/cart");
            return;
          }

          setCartItems(filteredItems);
        }

        if (profileResult.status === 'fulfilled') {
          const u = profileResult.value;
          setFormData(prev => ({
            ...prev,
            email: u.email || "",
            firstName: u.name || "",
          }));
        }

        if (promoResult.status === 'fulfilled') {
          setVouchers(promoResult.value.filter((v: Voucher) => v.isActive));
        }

        if (addressResult.status === 'fulfilled') {
          const addrs = addressResult.value;
          setUserAddresses(addrs);
          const defaultAddr = addrs.find((a: AddressResponse) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setFormData(prev => ({
              ...prev,
              firstName: defaultAddr.receiverName,
              phone: defaultAddr.phone,
              address: defaultAddr.address,
              city: "", // Backend address is one string, so we'll put it all in 'address'
              district: "",
              ward: ""
            }));
          }
        }

        if (settingsResult.status === 'fulfilled') {
          const settingsMap = settingsResult.value.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {} as Record<string, string>);
          setSettings(settingsMap);
        }
      } catch (error) {
        console.error("Failed to load checkout data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      if (settings["cod_enabled"] !== "false") {
        setPaymentMethod("cod");
      } else if (settings["vnpay_enabled"] !== "false") {
        setPaymentMethod("vnpay");
      } else if (settings["momo_enabled"] !== "false") {
        setPaymentMethod("momo");
      }
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountAmount = appliedVoucherResult?.discountAmount || 0;

  const selectedShipping = shippingMethods.find(
    (m) => m.id === shippingMethod
  );

  const isFreeShippingRule = subtotal >= 500000;
  const isFreeShippingPromo = appliedVoucherResult?.type === "SHIPPING";

  const shipping = (isFreeShippingRule || isFreeShippingPromo) ? 0 : (selectedShipping?.price || 0);
  const total = subtotal - discountAmount + shipping;

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        formData.email &&
        formData.phone &&
        formData.firstName &&
        formData.address
      );
    }
    return true;
  };

  const handleAddressSelect = (addrId: string) => {
    const id = parseInt(addrId);
    setSelectedAddressId(id);
    const addr = userAddresses.find(a => a.id === id);
    if (addr) {
      setFormData(prev => ({
        ...prev,
        firstName: addr.receiverName,
        phone: addr.phone,
        address: addr.address,
        ward: "",
        district: "",
        city: ""
      }));
    }
  };

  const handleAddAddress = async () => {
    const receiverName = sanitizeInput(newAddressData.receiverName);
    const phone = sanitizeInput(newAddressData.phone);
    const address = sanitizeInput(newAddressData.address);

    if (!receiverName || !phone || !address) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    if (!isValidName(receiverName)) {
      toast.error("Họ tên không hợp lệ (2-50 ký tự, chỉ chứa chữ cái)");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Số điện thoại không đúng định dạng Việt Nam");
      return;
    }

    setIsAddingAddress(true);
    try {
      await addAddress({
        ...newAddressData,
        receiverName,
        phone,
        address
      });
      toast.success("Đã thêm địa chỉ mới");
      const addrs = await loadAddresses();

      // Auto select the new address
      const newAddr = addrs[addrs.length - 1];
      if (newAddr) {
        handleAddressSelect(newAddr.id.toString());
      }

      setIsAddAddressDialogOpen(false);
      setNewAddressData({
        receiverName: "",
        phone: "",
        address: "",
        isDefault: false
      });
    } catch (error) {
      toast.error("Không thể thêm địa chỉ mới");
      console.error(error);
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const email = sanitizeInput(formData.email);
    const phone = sanitizeInput(formData.phone);
    const firstName = sanitizeInput(formData.firstName);
    const lastName = sanitizeInput(formData.lastName);
    const address = sanitizeInput(formData.address);

    if (!email || !phone || !firstName || !address) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Số điện thoại không đúng định dạng");
      return;
    }

    if (!isValidName(firstName)) {
      toast.error("Họ tên không hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await checkout({
        cartItemIds: cartItems.map(item => Number(item.id)),
        addressId: selectedAddressId || undefined,
        paymentMethod: paymentMethod.toUpperCase(),
        voucherCode: appliedVoucherResult?.code,
      });

      toast.success("Đặt hàng thành công!");

      // try {
      //   const myOrders = await fetchMyOrders();
      //   const recentOrders = myOrders.slice(0, 10);
      //   const webhookPayload = recentOrders.map((o: any) => ({
      //     order_id: String(o.id),
      //     user_id: formData.email || "unknown",
      //     total: o.totalPrice,
      //     payment_method: o.paymentMethod || paymentMethod.toUpperCase(),
      //     created_at: o.orderDate || new Date().toISOString()
      //   }));
      //   await triggerWebhook(webhookPayload);
      //   console.log("Đã gửi thông tin đơn hàng tới hệ thống thành công");
      // } catch (webhookError) {
      //   console.error("Gửi webhook thất bại:", webhookError);
      // }

      if (paymentMethod === "vnpay") {
        if (order.paymentUrl) {
          window.location.href = order.paymentUrl;
          return;
        } else {
          toast.error("Không tìm thấy liên kết thanh toán VNPay");
        }
      }

      router.push("/payment-result?status=success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đặt hàng thất bại, vui lòng thử lại sau.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    const targetCode = code || couponCode;
    if (!targetCode) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    try {
      const result = await applyVoucher({
        code: targetCode,
        orderAmount: subtotal
      });
      setAppliedVoucherResult(result);
      const voucher = vouchers.find(v => v.code === result.code);
      if (voucher) setSelectedVoucher(voucher);
      toast.success(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mã giảm giá không hợp lệ";
      toast.error(message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
          Thanh toán ✿
        </h1>
        <p className="text-muted-foreground">
          Hoàn tất đơn hàng chỉ với vài bước đơn giản
        </p>
      </div>

      {/* Steps Progress */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted mx-16 sm:mx-20">
            <div
              className="h-full bg-gradient-to-r from-primary to-rose-400 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${currentStep > step.id
                  ? "bg-gradient-to-br from-primary to-rose-400 text-white shadow-lg shadow-primary/30"
                  : currentStep === step.id
                    ? "bg-white text-primary border-2 border-primary shadow-lg shadow-primary/20"
                    : "bg-muted/60 text-muted-foreground border border-border"
                  }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-colors ${currentStep >= step.id
                  ? "text-primary"
                  : "text-muted-foreground"
                  }`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Customer Info */}
          {currentStep === 1 && (
            <Card className="border-primary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-light/40 to-secondary/20 border-b border-primary/10 py-5">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      Họ và tên <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Nguyễn Văn A"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="rounded-lg border-primary/15 focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Tên đệm
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Van"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="rounded-lg border-primary/15 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="rounded-lg border-primary/15 focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0901234567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="rounded-lg border-primary/15 focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Địa chỉ <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="address"
                      name="address"
                      placeholder="Số nhà, tên đường"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="rounded-lg border-primary/15 focus:border-primary focus:ring-primary/20 pr-10"
                      required
                    />
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  </div>

                  {userAddresses.length > 0 ? (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-primary-light/10 to-transparent border border-primary/5 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-widest opacity-80">
                          <Sparkles className="h-3 w-3" />
                          Chọn từ địa chỉ đã lưu
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[10px] text-primary h-auto p-0 hover:bg-transparent font-bold flex items-center gap-1"
                          onClick={() => setIsAddAddressDialogOpen(true)}
                        >
                          <Plus className="h-3 w-3" />
                          Thêm mới
                        </Button>
                      </div>
                      <Select
                        value={selectedAddressId?.toString()}
                        onValueChange={handleAddressSelect}
                      >
                        <SelectTrigger className="rounded-lg border-primary/10 bg-white/50 backdrop-blur-sm text-xs h-9 shadow-sm hover:border-primary/30 transition-all">
                          <SelectValue placeholder="Chọn địa chỉ để tự động điền" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {userAddresses.map((addr) => (
                            <SelectItem key={addr.id} value={addr.id.toString()} className="text-xs focus:bg-primary-light/20">
                              <div className="flex items-start gap-2 py-1.5">
                                <div className={`mt-0.5 p-1 rounded-md ${addr.isDefault ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  {addr.isDefault ? <Home className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold truncate">{addr.receiverName}</span>
                                    {addr.isDefault && <Badge className="text-[8px] h-3.5 px-1 bg-primary/20 text-primary border-none">Mặc định</Badge>}
                                  </div>
                                  <span className="text-muted-foreground truncate opacity-80">{addr.address}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-primary-light/10 to-transparent border border-primary/5 flex items-center justify-between shadow-sm">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-primary">Địa chỉ của bạn</p>
                        <p className="text-[11px] text-muted-foreground">Lưu địa chỉ để thanh toán nhanh hơn cho lần sau</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-primary/20 hover:bg-primary/5 text-primary text-xs font-bold h-8 gap-1"
                        onClick={() => setIsAddAddressDialogOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm mới
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tạm ẩn Phường, Quận, Thành phố */}
                <div className="hidden grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ward" className="text-sm font-medium">
                      Phường/Xã
                    </Label>
                    <Input
                      id="ward"
                      name="ward"
                      placeholder="Phường Bến Nghé"
                      value={formData.ward}
                      onChange={handleInputChange}
                      className="rounded-lg border-primary/15 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-sm font-medium">
                      Quận/Huyện <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="district"
                      name="district"
                      placeholder="Quận 1"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="rounded-lg border-primary/15 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      Tỉnh/Thành phố <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="TP. Hồ Chí Minh"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="rounded-lg border-primary/15 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Ghi chú đơn hàng
                  </Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Ghi chú cho người giao hàng (tuỳ chọn)"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="rounded-lg border-primary/15 focus:border-primary focus:ring-primary/20"
                  />
                </div>

              </CardContent>
            </Card>
          )}

          {/* Step 2: Shipping */}
          {currentStep === 2 && (
            <Card className="border-primary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-light/40 to-secondary/20 border-b border-primary/10 py-5">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-4 w-4" />
                  </div>
                  Phương thức vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                  className="space-y-3"
                >
                  {shippingMethods.map((method) => {
                    const isDisabled =
                      !!method.minOrder && subtotal < method.minOrder;
                    const isSelected = shippingMethod === method.id;
                    const IconComp = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected
                          ? "border-primary bg-gradient-to-r from-primary-light/30 to-secondary/15 shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-primary-light/10"
                          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            disabled={isDisabled}
                          />
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                              }`}
                          >
                            <IconComp className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-sm">
                          {method.price === 0 || (isFreeShippingRule && method.id === "standard") ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                              Miễn phí
                            </span>
                          ) : (
                            formatPrice(method.price)
                          )}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>

                {/* Shipping info note */}
                <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary-light/20 to-transparent border border-primary/10">
                  <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Miễn phí vận chuyển</span> cho đơn hàng từ{" "}
                    <span className="font-semibold text-primary">500.000₫</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <Card className="border-primary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-light/40 to-secondary/20 border-b border-primary/10 py-5">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {paymentMethods.filter(method => {
                    if (method.id === "vnpay") {
                      return settings["vnpay_enabled"] !== "false";
                    }
                    if (method.id === "cod") {
                      return settings["cod_enabled"] !== "false";
                    }
                    if (method.id === "momo") {
                      return settings["momo_enabled"] !== "false";
                    }
                    return true;
                  }).map((method) => {
                    const isSelected = paymentMethod === method.id;
                    const IconComp = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected
                          ? "border-primary bg-gradient-to-r from-primary-light/30 to-secondary/15 shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-primary-light/10"
                          }`}
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                            }`}
                        >
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </label>
                    );
                  })}
                </RadioGroup>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-medium">
                      Thông tin thanh toán được bảo mật bằng mã hóa SSL 256-bit
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Review Summary for Step 3 */}
          {currentStep === 3 && (
            <Card className="border-primary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-light/40 to-secondary/20 border-b border-primary/10 py-5">
                <CardTitle className="flex items-center gap-2 text-primary text-base">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                  Xác nhận thông tin
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-xs text-muted-foreground mb-1">Người nhận</p>
                    <p className="text-sm font-medium">
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.phone}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-xs text-muted-foreground mb-1">Địa chỉ</p>
                    <p className="text-sm font-medium">
                      {formData.address}
                    </p>
                    {/* Tạm ẩn thông tin chi tiết địa chỉ */}
                    {(formData.ward || formData.district || formData.city) && (
                      <p className="hidden text-xs text-muted-foreground mt-1">
                        {formData.ward && `${formData.ward}, `}
                        {formData.district}, {formData.city}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-xs text-muted-foreground mb-1">Vận chuyển</p>
                  <p className="text-sm font-medium">
                    {selectedShipping?.name} —{" "}
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Miễn phí</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="rounded-full px-6 border-primary/20 hover:bg-primary-light/20 hover:border-primary/40"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="rounded-full px-6 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary shadow-md shadow-primary/20"
              >
                Tiếp tục
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-full px-8 bg-gradient-to-r from-primary to-rose-500 hover:from-rose-500 hover:to-primary shadow-lg shadow-primary/25 text-white font-semibold"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">✿</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Đặt hàng — {formatPrice(total)}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card className="border-primary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-light/40 to-secondary/20 border-b border-primary/10 py-5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-primary" />
                  Đơn hàng của bạn
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    {cartItems.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary-light/30 to-secondary/20 flex-shrink-0 border border-primary/10">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-primary to-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.variant}
                        </p>
                        <p className="text-sm font-semibold bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-primary/10" />

                {/* Coupon Code */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Mã giảm giá"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="pl-9 rounded-lg border-primary/15 text-sm"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleApplyCoupon(couponCode)}
                      className="rounded-lg border-primary/20 hover:bg-primary hover:text-white text-sm px-4"
                    >
                      Áp dụng
                    </Button>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => setIsVoucherDialogOpen(true)}
                    className="text-xs text-primary h-auto p-0 flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    Chọn từ danh sách voucher
                  </Button>
                </div>

                {appliedVoucherResult && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-primary-light/20 border border-primary/20">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Badge className="bg-primary text-[10px] h-5">{appliedVoucherResult.code}</Badge>
                      <span className="text-[10px] text-muted-foreground truncate">Tiết kiệm {formatPrice(appliedVoucherResult.discountAmount)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setAppliedVoucherResult(null);
                        setSelectedVoucher(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                )}

                <Separator className="bg-primary/10" />

                {/* Totals */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Giảm giá
                      </span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vận chuyển</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                          Miễn phí
                        </span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                </div>

                <Separator className="bg-primary/10" />

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-base">Tổng cộng</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
                    {formatPrice(total)}
                  </span>
                </div>
              </CardContent>
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

            {/* Add Address Dialog */}
            <Dialog open={isAddAddressDialogOpen} onOpenChange={setIsAddAddressDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif">Thêm địa chỉ giao hàng mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-receiverName" className="text-sm font-medium">
                      Họ và tên người nhận <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="new-receiverName"
                      placeholder="Nguyễn Văn A"
                      value={newAddressData.receiverName}
                      onChange={(e) => setNewAddressData(prev => ({ ...prev, receiverName: e.target.value }))}
                      className="rounded-lg border-primary/15 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-phone" className="text-sm font-medium">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="new-phone"
                      type="tel"
                      placeholder="0901234567"
                      value={newAddressData.phone}
                      onChange={(e) => setNewAddressData(prev => ({ ...prev, phone: e.target.value }))}
                      className="rounded-lg border-primary/15 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-address" className="text-sm font-medium">
                      Địa chỉ chi tiết <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="new-address"
                      placeholder="Số nhà, tên đường, phường/xã..."
                      value={newAddressData.address}
                      onChange={(e) => setNewAddressData(prev => ({ ...prev, address: e.target.value }))}
                      className="rounded-lg border-primary/15 focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="new-isDefault"
                      checked={newAddressData.isDefault}
                      onChange={(e) => setNewAddressData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary/20"
                    />
                    <label htmlFor="new-isDefault" className="text-sm text-muted-foreground cursor-pointer">
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => setIsAddAddressDialogOpen(false)}
                      disabled={isAddingAddress}
                    >
                      Hủy
                    </Button>
                    <Button
                      className="flex-1 rounded-full bg-primary hover:bg-primary-hover shadow-md shadow-primary/20"
                      onClick={handleAddAddress}
                      disabled={isAddingAddress}
                    >
                      {isAddingAddress ? (
                        <>
                          <span className="animate-spin mr-2">✿</span>
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu địa chỉ"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-xs font-medium">Bảo mật SSL</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-primary/10">
                <Truck className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-xs font-medium">Giao hàng nhanh</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-primary/10">
                <Gift className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-xs font-medium">Quà tặng kèm</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-primary/10">
                <Heart className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-xs font-medium">Chính hãng 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
