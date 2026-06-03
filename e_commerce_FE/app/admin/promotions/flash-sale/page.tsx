"use client";

import { useState, useEffect } from "react";
import { adminFetchAllFlashSales, createFlashSale, toggleFlashSale, updateFlashSale, FlashSaleResponse } from "@/lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { Plus, Power, Settings, Clock, Tag, Pencil } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function FlashSaleAdminPage() {
  const [flashSales, setFlashSales] = useState<FlashSaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminFetchAllFlashSales();
      setFlashSales(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách Flash Sale",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.startTime || !formData.endTime) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
        });
        return;
      }

      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Thời gian bắt đầu phải trước thời gian kết thúc",
        });
        return;
      }

      // Format to YYYY-MM-DDTHH:mm:ss (no Z)
      const formatLocal = (dateString: string) => {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
        return localISOTime.split('.')[0];
      };

      await createFlashSale({
        name: formData.name,
        startTime: formatLocal(formData.startTime),
        endTime: formatLocal(formData.endTime),
      });

      toast({
        title: "Thành công",
        description: "Đã tạo đợt Flash Sale mới",
      });
      setIsCreateOpen(false);
      setFormData({ name: "", startTime: "", endTime: "" });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi tạo",
      });
    }
  };

  const handleEditClick = (sale: FlashSaleResponse) => {
    setEditingId(sale.id);
    
    // Format the date to YYYY-MM-DDTHH:mm string for the input
    const formatForInput = (dateString: string) => {
      const date = new Date(dateString);
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
      return localISOTime.split('.')[0].slice(0, 16); // format: "YYYY-MM-DDTHH:mm"
    };

    setEditFormData({
      name: sale.name,
      startTime: formatForInput(sale.startTime),
      endTime: formatForInput(sale.endTime),
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      if (!editingId) return;
      if (!editFormData.name || !editFormData.startTime || !editFormData.endTime) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
        });
        return;
      }

      if (new Date(editFormData.startTime) >= new Date(editFormData.endTime)) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Thời gian bắt đầu phải trước thời gian kết thúc",
        });
        return;
      }

      const formatLocal = (dateString: string) => {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
        return localISOTime.split('.')[0];
      };

      await updateFlashSale(editingId, {
        name: editFormData.name,
        startTime: formatLocal(editFormData.startTime),
        endTime: formatLocal(editFormData.endTime),
      });

      toast({
        title: "Thành công",
        description: "Đã cập nhật đợt Flash Sale",
      });
      setIsEditOpen(false);
      setEditingId(null);
      setEditFormData({ name: "", startTime: "", endTime: "" });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi cập nhật",
      });
    }
  };

  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    const actionText = currentActive ? "tạm dừng" : "kích hoạt lại";
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} đợt Flash Sale này không?`)) return;
    
    try {
      await toggleFlashSale(id);
      toast({
        title: "Thành công",
        description: `Đã ${currentActive ? "tạm dừng" : "kích hoạt"} đợt Flash Sale`,
      });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Flash Sale</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tạo đợt Sale mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Flash Sale mới</DialogTitle>
              <DialogDescription>
                Thiết lập thời gian và tên gọi cho chương trình khuyến mãi chớp nhoáng.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tên chương trình</Label>
                <Input
                  placeholder="VD: Siêu Sale 9/9"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian bắt đầu</Label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian kết thúc</Label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
              <Button onClick={handleCreate}>Tạo mới</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật Flash Sale</DialogTitle>
              <DialogDescription>
                Thay đổi thời gian và tên gọi cho chương trình khuyến mãi.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tên chương trình</Label>
                <Input
                  placeholder="VD: Siêu Sale 9/9"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian bắt đầu</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.startTime}
                  onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian kết thúc</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.endTime}
                  onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
              <Button onClick={handleUpdate}>Cập nhật</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        ) : flashSales.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            Không có chương trình Flash Sale nào.
          </div>
        ) : (() => {
          // Grouping logic
          const groupedSales = flashSales.reduce((acc, sale) => {
            const start = new Date(sale.startTime);
            const monthKey = format(start, "yyyy-MM"); // Sortable key e.g., "2026-05"
            const monthLabel = format(start, "'Tháng' MM/yyyy", { locale: vi });
            if (!acc[monthKey]) {
              acc[monthKey] = { label: monthLabel, sales: [] };
            }
            acc[monthKey].sales.push(sale);
            return acc;
          }, {} as Record<string, { label: string; sales: FlashSaleResponse[] }>);

          // Sort groups descending (newer months first)
          const sortedGroupKeys = Object.keys(groupedSales).sort((a, b) => b.localeCompare(a));

          return (
            <Accordion type="multiple" className="w-full space-y-4" defaultValue={sortedGroupKeys}>
              {sortedGroupKeys.map((key) => {
                const group = groupedSales[key];
                return (
                  <AccordionItem key={key} value={key} className="border rounded-lg px-4 bg-card shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg text-primary">{group.label}</span>
                        <Badge variant="secondary" className="font-semibold text-xs">
                          {group.sales.length} chương trình
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead>Tên Chương Trình</TableHead>
                              <TableHead>Thời Gian Bắt Đầu</TableHead>
                              <TableHead>Thời Gian Kết Thúc</TableHead>
                              <TableHead>Sản phẩm</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.sales.map((sale) => {
                              const now = new Date();
                              const start = new Date(sale.startTime);
                              const end = new Date(sale.endTime);
                              
                              let statusInfo = { label: "Sắp diễn ra", color: "bg-blue-500 hover:bg-blue-600" };
                              if (!sale.isActive) statusInfo = { label: "Đã tắt", color: "bg-gray-500 hover:bg-gray-600" };
                              else if (now >= start && now <= end) statusInfo = { label: "Đang diễn ra", color: "bg-rose-500 hover:bg-rose-600 animate-pulse" };
                              else if (now > end) statusInfo = { label: "Đã kết thúc", color: "bg-gray-500 hover:bg-gray-600" };

                              return (
                                <TableRow key={sale.id} className="hover:bg-muted/30 transition-colors">
                                  <TableCell className="font-semibold text-foreground/90">{sale.name}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center text-sm">
                                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                      {format(start, "dd/MM/yyyy HH:mm", { locale: vi })}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center text-sm">
                                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                      {format(end, "dd/MM/yyyy HH:mm", { locale: vi })}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="font-medium">
                                      <Tag className="mr-1 h-3 w-3 text-primary" />
                                      {sale.products?.length || 0} SP
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${statusInfo.color} text-white border-none font-semibold px-2.5 py-0.5 rounded-full`}>
                                      {statusInfo.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-2">
                                      <Button variant="outline" size="sm" className="h-8 rounded-md" onClick={() => handleEditClick(sale)}>
                                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Sửa
                                      </Button>
                                      <Button asChild variant="outline" size="sm" className="h-8 rounded-md">
                                        <Link href={`/admin/promotions/flash-sale/${sale.id}`}>
                                          <Settings className="mr-1.5 h-3.5 w-3.5" /> Cài đặt
                                        </Link>
                                      </Button>
                                      <Button
                                        variant={sale.isActive ? "destructive" : "default"}
                                        size="sm"
                                        className={`h-8 rounded-md ${!sale.isActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                                        onClick={() => handleToggleStatus(sale.id, sale.isActive)}
                                      >
                                        <Power className="mr-1.5 h-3.5 w-3.5" />
                                        {sale.isActive ? "Dừng" : "Bật"}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          );
        })()}
      </div>
    </div>
  );
}
