"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams?.get("status");

  const isSuccess = status === "success";
  const isFail = status === "fail";
  const isError = status === "error";

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-primary/10 shadow-xl overflow-hidden">
        <CardHeader className={`text-center py-10 ${isSuccess ? "bg-emerald-50" : isFail ? "bg-rose-50" : "bg-amber-50"
          }`}>
          <div className="flex justify-center mb-4">
            {isSuccess ? (
              <CheckCircle2 className="h-20 w-20 text-emerald-500 animate-in zoom-in duration-500" />
            ) : isFail ? (
              <XCircle className="h-20 w-20 text-rose-500 animate-bounce" />
            ) : (
              <AlertCircle className="h-20 w-20 text-amber-500" />
            )}
          </div>
          <CardTitle className={`text-2xl font-serif font-bold ${isSuccess ? "text-emerald-700" : isFail ? "text-rose-700" : "text-amber-700"
            }`}>
            {isSuccess ? "Thanh toán thành công! ✿" : isFail ? "Thanh toán thất bại" : "Thông báo thanh toán"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 text-center space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {isSuccess
              ? "Cảm ơn bạn đã tin tưởng lựa chọn GlowSkin. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn."
              : isFail
                ? "Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại phương thức thanh toán hoặc liên hệ với chúng tôi để được hỗ trợ."
                : "Chúng tôi không thể xác định trạng thái thanh toán của bạn vào lúc này. Vui lòng kiểm tra email hoặc lịch sử đơn hàng."}
          </p>
          <div className="pt-4 space-y-3">
            <Button
              className="w-full rounded-full bg-gradient-to-r from-primary to-rose-400 hover:opacity-90 shadow-lg"
              onClick={() => router.push("/account/orders")}
            >
              Xem đơn hàng của tôi
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border-primary/20"
              onClick={() => router.push("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 justify-center">
          <p className="text-xs text-muted-foreground">
            Mọi thắc mắc vui lòng liên hệ hotline: <span className="font-semibold">1900 0000</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-background via-primary-light/5 to-secondary/5">
        <Suspense fallback={
          <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-20 w-20 bg-muted rounded-full mb-4" />
              <div className="h-8 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          </div>
        }>
          <PaymentResultContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
