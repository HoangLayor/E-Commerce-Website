import Link from "next/link";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Heart,
  Sparkles,
  Truck,
  ShieldCheck,
  Gift,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Đặt hàng thành công | GlowSkin",
  description: "Cảm ơn bạn đã đặt hàng tại GlowSkin",
};

export default function CheckoutSuccessPage() {
  // In real app, this would come from the order created
  const orderNumber = "VN260128001";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-background via-primary-light/15 to-secondary/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            {/* Success Icon with decorative ring */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              {/* Decorative sparkles */}
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400" />
              <Heart className="absolute -bottom-1 -left-2 h-5 w-5 text-primary fill-primary" />
            </div>

            {/* Message */}
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
              Đặt Hàng Thành Công! ✿
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Cảm ơn bạn đã tin tưởng và mua sắm tại{" "}
              <span className="font-semibold text-primary">GlowSkin</span>. Chúng
              tôi sẽ gửi email xác nhận đơn hàng và thông tin vận chuyển đến bạn
              trong thời gian sớm nhất.
            </p>

            {/* Order Info Card */}
            <Card className="mb-8 border-primary/10 overflow-hidden shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-primary via-rose-400 to-secondary" />
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium text-lg">Mã đơn hàng</span>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent mb-4">
                  {orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vui lòng lưu lại mã đơn hàng để theo dõi tình trạng giao hàng
                </p>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="mb-8 border-primary/10 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-sm">Các bước tiếp theo</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-rose-400 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Xác nhận đơn hàng</p>
                      <p className="text-xs text-muted-foreground">
                        Email xác nhận sẽ được gửi ngay lập tức
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-rose-300 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm">Chuẩn bị hàng</p>
                      <p className="text-xs text-muted-foreground">
                        Đơn hàng sẽ được đóng gói cẩn thận trong 1-2 ngày
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold border border-border">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm">Giao hàng</p>
                      <p className="text-xs text-muted-foreground">
                        Đơn vị vận chuyển sẽ giao hàng đến bạn
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="rounded-full px-6 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary shadow-md shadow-primary/20"
              >
                <Link href="/account/orders">
                  Theo dõi đơn hàng
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-6 border-primary/20 hover:bg-primary-light/20"
              >
                <Link href="/products">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tiếp tục mua sắm
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-10 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-xs">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Chính hãng</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Truck className="h-4 w-4 text-primary" />
                <span>Giao nhanh</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Gift className="h-4 w-4 text-primary" />
                <span>Quà tặng kèm</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
