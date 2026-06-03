"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, type AddressResponse } from "@/lib/api";
import { toast } from "sonner";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);

  const [formData, setFormData] = useState({
    receiverName: "",
    phone: "",
    address: "",
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (error) {
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      toast.success("Đã đặt địa chỉ mặc định");
      loadAddresses();
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await deleteAddress(id);
      toast.success("Đã xóa địa chỉ");
      loadAddresses();
    } catch (error) {
      toast.error("Không thể xóa địa chỉ");
    }
  };

  const resetForm = () => {
    setFormData({
      receiverName: "",
      phone: "",
      address: "",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleOpenDialog = (address?: AddressResponse) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        receiverName: address.receiverName,
        phone: address.phone,
        address: address.address,
        isDefault: address.isDefault,
      });
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await addAddress(formData);
        toast.success("Thêm địa chỉ thành công");
      }
      setIsOpen(false);
      loadAddresses();
    } catch (error) {
      toast.error("Lưu địa chỉ thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Sổ Địa Chỉ
          </h1>
          <p className="text-muted-foreground">
            Quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm địa chỉ
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverName">Họ và tên</Label>
                <Input 
                  id="receiverName" 
                  placeholder="Nguyễn Văn A" 
                  required
                  value={formData.receiverName}
                  onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input 
                  id="phone" 
                  placeholder="0901234567" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ đầy đủ</Label>
              <Input 
                id="address" 
                placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố" 
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              <p className="text-xs text-muted-foreground italic">
                Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                Lưu địa chỉ
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{address.receiverName}</span>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-muted-foreground">
                          {address.phone}
                        </span>
                        {address.isDefault && (
                          <Badge
                            variant="secondary"
                            className="bg-primary-light text-primary"
                          >
                            Mặc định
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {address.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="text-primary hover:text-primary-hover"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Đặt mặc định
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenDialog(address)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(address.id)}
                      disabled={address.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!isLoading && addresses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Chưa có địa chỉ nào</h3>
            <p className="text-muted-foreground mb-4">
              Thêm địa chỉ để việc giao hàng nhanh hơn
            </p>
            <Button
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm địa chỉ đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
