"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Đang xác thực thanh toán...");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryString = searchParams.toString();
        const res = await fetch(`${API_BASE_URL}/api/payment/vnpay-return?${queryString}`, {
          method: "GET",
          credentials: "include",
        });

        const result = await res.json();
        if (res.ok && result.status === "OK") {
          setStatus("success");
          setMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.");
        } else {
          setStatus("failed");
          setMessage(result.message || "Thanh toán thất bại hoặc có lỗi xảy ra.");
        }
      } catch (error) {
        setStatus("failed");
        setMessage("Không thể kết nối với máy chủ để xác thực thanh toán.");
      }
    };

    if (searchParams.get("vnp_ResponseCode")) {
      verifyPayment();
    } else {
      setStatus("failed");
      setMessage("Thông tin thanh toán không hợp lệ.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary-light/5 to-secondary/5">
      <Card className="w-full max-w-md border-primary/10 shadow-xl overflow-hidden">
        <CardHeader className={`text-center py-8 ${
          status === 'success' ? 'bg-emerald-50' : 
          status === 'failed' ? 'bg-rose-50' : 'bg-muted/30'
        }`}>
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            )}
            {status === "failed" && (
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center shadow-lg shadow-rose-200/50">
                <XCircle className="h-8 w-8 text-rose-600" />
              </div>
            )}
          </div>
          <CardTitle className="font-serif text-2xl">
            {status === "loading" ? "Đang xử lý..." : 
             status === "success" ? "Thanh toán thành công" : "Thanh toán thất bại"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 pb-6 text-center">
          <p className="text-muted-foreground leading-relaxed">
            {message}
          </p>
          
          {status === "success" && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
              Đơn hàng của bạn đang được xử lý. Bạn có thể theo dõi trạng thái đơn hàng trong phần quản lý tài khoản.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Button 
            className="w-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
            onClick={() => router.push(status === 'success' ? "/account" : "/checkout")}
          >
            {status === 'success' ? "Xem đơn hàng của tôi" : "Thử lại thanh toán"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground hover:bg-muted/50"
            onClick={() => router.push("/")}
          >
            Về trang chủ
          </Button>
        </CardFooter>
      </Card>
      
      {/* Decorative elements */}
      <div className="fixed -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-24 -left-24 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Đang tải...</div>}>
      <PaymentReturnContent />
    </Suspense>
  );
}
