"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, Copy, Check, Clock, Gift, Loader2, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPublicVouchers, type Voucher } from "@/lib/api";
import { formatPrice } from "@/lib/data";
import { toast } from "sonner";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function VoucherCard({
  voucher,
}: {
  voucher: Voucher;
}) {
  const [copied, setCopied] = useState(false);
  const isExpired = !voucher.isActive || new Date(voucher.expiryDate) < new Date();
  const isFullyUsed = voucher.usageLimit !== undefined && voucher.usedCount >= voucher.usageLimit;

  const copyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success(`Đã sao chép mã ${voucher.code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDiscountLabel = () => {
    if (voucher.type === "PERCENT") return `-${voucher.value}%`;
    return `-${formatPrice(voucher.value)}`;
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 border-border/50 hover:shadow-md ${isExpired || isFullyUsed ? "opacity-60 grayscale-[0.5]" : "hover:border-primary/40 group"}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Left section - Discount amount */}
          <div
            className={`flex flex-col items-center justify-center p-6 sm:p-8 ${isExpired || isFullyUsed ? "bg-muted" : "bg-gradient-to-br from-primary-light to-rose-100"} sm:min-w-[160px] relative overflow-hidden`}
          >
            {/* Background decoration */}
            <div className="absolute -left-4 -top-4 w-12 h-12 bg-white/20 rounded-full blur-xl"></div>
            
            <Ticket
              className={`h-10 w-10 mb-2 ${isExpired || isFullyUsed ? "text-muted-foreground" : "text-primary group-hover:scale-110 transition-transform"}`}
            />
            <span
              className={`font-bold text-2xl tracking-tighter ${isExpired || isFullyUsed ? "text-muted-foreground" : "text-primary"}`}
            >
              {getDiscountLabel()}
            </span>
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">Voucher</p>
          </div>

          {/* Right section - Details */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="font-mono font-bold text-xl tracking-tight bg-muted/50 px-3 py-1 rounded-lg border border-border/50">
                  {voucher.code}
                </span>
                {isExpired ? (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                    <XCircle className="h-3 w-3" /> Hết hạn
                  </Badge>
                ) : isFullyUsed ? (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
                    <AlertCircle className="h-3 w-3" /> Hết lượt dùng
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Còn hiệu lực
                  </Badge>
                )}
              </div>

              <p className="text-foreground/80 font-medium text-sm mb-3">
                {voucher.type === 'PERCENT' ? `Giảm ${voucher.value}% đơn hàng` : `Giảm trực tiếp ${formatPrice(voucher.value)}`} cho đơn từ {formatPrice(voucher.minOrderValue)}
                {voucher.maxDiscount && ` (Tối đa ${formatPrice(voucher.maxDiscount)})`}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Info className="h-3.5 w-3.5" />
                  Đơn tối thiểu: {formatPrice(voucher.minOrderValue)}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  Hạn sử dụng: {formatDate(voucher.expiryDate)}
                </span>
                {voucher.usageLimit && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Check className="h-3.5 w-3.5" />
                    Đã dùng: {voucher.usedCount}/{voucher.usageLimit}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-0 sm:absolute sm:top-5 sm:right-5">
              {!isExpired && !isFullyUsed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCode}
                  className="w-full sm:w-auto rounded-full bg-white hover:bg-primary hover:text-white border-primary/20 shadow-sm transition-all duration-300"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4" />
                      Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-4 w-4" />
                      Sao chép
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Icon markers for badge
function CheckCircle2({ className }: { className?: string }) {
  return <Check className={className} />;
}
function XCircle({ className }: { className?: string }) {
  return <Info className={className} />;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPublicVouchers();
      setVouchers(data);
    } catch (error) {
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setIsLoading(false);
    }
  };

  const activeVouchers = vouchers.filter(v => v.isActive && new Date(v.expiryDate) > new Date() && (v.usageLimit === undefined || v.usedCount < v.usageLimit));
  const otherVouchers = vouchers.filter(v => !activeVouchers.some(av => av.id === v.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
             <Ticket className="h-8 w-8 text-primary" />
             Voucher Của Tôi
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Quản lý và sử dụng các mã ưu đãi độc quyền từ GlowSkin
          </p>
        </div>
        <Button onClick={loadVouchers} variant="ghost" size="sm" className="h-9 rounded-full text-muted-foreground hover:text-primary">
           <Clock className="h-4 w-4 mr-2" /> Làm mới
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary via-rose-500 to-primary-hover text-white border-none shadow-xl shadow-primary/20 overflow-hidden relative">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-8 bg-background rounded-r-full"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-8 bg-background rounded-l-full"></div>
        
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-center sm:text-left">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30 rotate-3">
                <Gift className="h-10 w-10 text-white" />
              </div>
              <div>
                <p className="text-white/80 font-medium tracking-wide uppercase text-xs mb-1">Mã giảm giá đang hoạt động</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{activeVouchers.length}</span>
                  <span className="text-lg font-medium opacity-80 uppercase tracking-tighter">Voucher</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-fit">
              <p className="text-[10px] font-bold uppercase mb-2 text-white/90">Nhập mã voucher mới</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="VD: GLOW50K" 
                  className="bg-white/20 border-white/30 rounded-lg px-4 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 w-full"
                />
                <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold px-6">
                   Áp dụng
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
          <p className="mt-4 text-muted-foreground font-medium animate-pulse">Đang tìm kiếm ưu đãi cho bạn...</p>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-full w-fit mb-8">
            <TabsTrigger value="active" className="rounded-full px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold">
              Còn hiệu lực ({activeVouchers.length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="rounded-full px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold">
              Hết hạn / Khác ({otherVouchers.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
            {activeVouchers.length > 0 ? (
              activeVouchers.map((voucher) => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))
            ) : (
              <div className="text-center py-24 bg-muted/20 rounded-[2rem] border-2 border-dashed border-muted">
                <Ticket className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="font-serif text-2xl font-bold mb-3 text-foreground/50">
                  Bạn hiện chưa có voucher nào
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                  Tiếp tục mua sắm để nhận những mã giảm giá độc quyền và ưu đãi vận chuyển từ chúng tôi!
                </p>
                <Button asChild size="lg" className="rounded-full px-12 shadow-lg shadow-primary/20">
                   <Link href="/products">Mua sắm ngay</Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expired" className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {otherVouchers.length > 0 ? (
              otherVouchers.map((voucher) => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                 <p>Dữ liệu trống</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

