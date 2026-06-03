"use client";

import React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, ShieldCheck, Truck, Gift, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!firstName || !lastName || !email || !password) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    const nameRegex = /^[\p{L}\s]+$/u;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      toast.error("Họ tên không hợp lệ (chỉ chứa chữ cái)");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không đúng định dạng");
      return;
    }

    if (phone && !/^(0|84)(3|5|7|8|9)([0-9]{8})$/.test(phone.replace(/\s/g, ""))) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      const name = `${lastName} ${firstName}`.trim();
      await registerUser(name, email, password);

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/account/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể kết nối đến server, vui lòng thử lại sau.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Branding */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-primary via-primary-hover to-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjEiIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 text-primary-foreground w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity w-fit">
            <Sparkles className="h-6 w-6" />
            <span className="font-serif text-xl font-bold">GlowSkin</span>
          </Link>

          {/* Content */}
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              Tham gia cùng
              <span className="block mt-1">GlowSkin</span>
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-md mb-10">
              Tạo tài khoản để trải nghiệm mua sắm mỹ phẩm chính hãng với hàng nghìn ưu đãi hấp dẫn.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Giảm 10% đơn hàng đầu tiên</p>
                  <p className="text-sm text-primary-foreground/70">Mã WELCOME10 tự động áp dụng</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Tích điểm mỗi đơn hàng</p>
                  <p className="text-sm text-primary-foreground/70">Đổi điểm lấy voucher hấp dẫn</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Miễn phí vận chuyển</p>
                  <p className="text-sm text-primary-foreground/70">Cho đơn hàng từ 300.000đ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-primary-foreground/50">
            © 2026 GlowSkin. Tất cả quyền được bảo lưu.
          </p>

          {/* Decorative */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex flex-col bg-gradient-to-br from-background via-primary-light/10 to-secondary/10">
        {/* Top bar with back link */}
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>
          <div className="lg:hidden inline-flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="font-serif text-lg font-bold">GlowSkin</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-12">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-serif text-2xl">
                  Tạo Tài Khoản
                </CardTitle>
                <CardDescription>
                  Đăng ký để nhận ưu đãi và theo dõi đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Họ *</Label>
                      <Input
                        id="lastName"
                        placeholder="Nguyễn"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Tên *</Label>
                      <Input
                        id="firstName"
                        placeholder="Văn A"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0901 234 567"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Tối thiểu 8 ký tự"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox id="terms" required className="mt-0.5" />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal leading-snug cursor-pointer"
                    >
                      Tôi đồng ý với{" "}
                      <Link
                        href="/terms"
                        className="text-primary hover:underline"
                      >
                        Điều khoản dịch vụ
                      </Link>{" "}
                      và{" "}
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        Chính sách bảo mật
                      </Link>
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
                  </Button>
                </form>

                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    Hoặc đăng ký với
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="#1877F2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                  Đã có tài khoản?{" "}
                  <Link
                    href="/account/login"
                    className="text-primary font-medium hover:underline"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
