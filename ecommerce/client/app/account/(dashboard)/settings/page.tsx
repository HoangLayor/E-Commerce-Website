"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchUserProfile, updateUserProfile, changePassword } from "@/lib/api";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [passForm, setPassForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: user.name,
      });
      toast.success("Cập nhật hồ sơ thành công");
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }
    setIsSaving(true);
    try {
      await changePassword({
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đổi mật khẩu thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Cài đặt tài khoản</h1>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân và bảo mật của bạn</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>Cập nhật thông tin cơ bản của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input 
                  id="name" 
                  value={user?.name || ""} 
                  onChange={(e) => setUser({...user, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription>Đảm bảo tài khoản của bạn luôn an toàn</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="oldPass">Mật khẩu hiện tại</Label>
                <Input 
                  id="oldPass" 
                  type="password" 
                  value={passForm.oldPassword}
                  onChange={(e) => setPassForm({...passForm, oldPassword: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPass">Mật khẩu mới</Label>
                <Input 
                  id="newPass" 
                  type="password" 
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPass">Xác nhận mật khẩu mới</Label>
                <Input 
                  id="confirmPass" 
                  type="password" 
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" variant="secondary" disabled={isSaving}>
                {isSaving ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
