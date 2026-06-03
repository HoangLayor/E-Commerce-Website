"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Percent,
  Tag,
  Loader2,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminFetchVouchers, adminCreateVoucher, adminUpdateVoucher, adminDeleteVoucher, type Voucher, type VoucherRequest } from "@/lib/api";
import { toast } from "sonner";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function formatValue(type: string, value: number) {
  switch (type) {
    case "PERCENT":
      return `${value}%`;
    case "FIXED":
      return formatCurrency(value);
    case "SHIPPING":
      return "Miễn phí ship";
    default:
      return value;
  }
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  
  const [formData, setFormData] = useState<VoucherRequest>({
    code: "",
    type: "PERCENT",
    value: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    usageLimit: 100,
    isActive: true,
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const data = await adminFetchVouchers();
      setVouchers(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (voucher: Voucher | null = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        minOrderValue: voucher.minOrderValue,
        maxDiscount: voucher.maxDiscount || 0,
        expiryDate: (voucher.expiryDate || "").split("T")[0],
        usageLimit: voucher.usageLimit || 0,
        isActive: voucher.isActive,
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: "",
        type: "PERCENT",
        value: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        usageLimit: 100,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // Ensure date is in ISO LocalDateTime format
      const submissionData = {
        ...formData,
        expiryDate: formData.expiryDate.includes("T") ? formData.expiryDate : `${formData.expiryDate}T23:59:59`,
      };

      if (editingVoucher) {
        await adminUpdateVoucher(editingVoucher.id, submissionData);
        toast.success("Cập nhật thành công");
      } else {
        await adminCreateVoucher(submissionData);
        toast.success("Tạo voucher mới thành công");
      }
      setIsDialogOpen(false);
      loadVouchers();
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
    }
  };

  // Note: Backend VoucherController doesn't have delete currently
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa voucher này không?")) {
      try {
        await adminDeleteVoucher(id);
        toast.success("Xóa voucher thành công");
        loadVouchers();
      } catch (error) {
        toast.error("Không thể xóa voucher");
      }
    }
  };

  const filteredVouchers = (vouchers || []).filter((v) => {
    const matchesSearch = v.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && v.isActive) ||
      (statusFilter === "inactive" && !v.isActive);
    return matchesSearch && matchesStatus;
  });

  const statsList = [
    {
      title: "Tổng Voucher",
      value: vouchers.length,
      icon: Ticket,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Đang hoạt động",
      value: vouchers.filter((v) => v.isActive).length,
      icon: Percent,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Tổng lượt dùng",
      value: vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0),
      icon: Tag,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Voucher (Mã giảm giá)
          </h1>
          <p className="text-muted-foreground">
            Quản lý các mã giảm giá cho khách hàng
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo voucher mới
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statsList.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả ({vouchers.length})</TabsTrigger>
          <TabsTrigger value="active">
            Đang hoạt động ({vouchers.filter((v) => v.isActive).length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Ngừng hoạt động ({vouchers.filter((v) => !v.isActive).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mã voucher..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Đơn tối thiểu</TableHead>
                  <TableHead>Sử dụng</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      Không tìm thấy voucher nào.
                    </TableCell>
                  </TableRow>
                ) : filteredVouchers.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-bold text-primary">
                      {v.code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {v.type === "PERCENT" ? "Phần trăm" : v.type === "FIXED" ? "Cố định" : "Shipping"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatValue(v.type, v.value)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(v.minOrderValue)}
                    </TableCell>
                    <TableCell>
                      {v.usedCount} / {v.usageLimit || "∞"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(v.expiryDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.isActive ? "default" : "secondary"}>
                        {v.isActive ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(v)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(v.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVoucher ? "Chỉnh sửa Voucher" : "Tạo Voucher mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã Voucher</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: GIAM20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Loại giảm giá</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val as any })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED">Số tiền cố định (đ)</SelectItem>
                    <SelectItem value="SHIPPING">Miễn phí Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Giá trị giảm</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrder">Đơn hàng tối thiểu</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Giảm tối đa (cho %)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Giới hạn lượt dùng</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Ngày hết hạn</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
              />
              <Label htmlFor="isActive">Đang kích hoạt</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} className="bg-primary text-white">
              {editingVoucher ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
