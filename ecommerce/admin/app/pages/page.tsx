"use client";

import React, { useEffect, useState } from "react";
import { 
  adminFetchPages, 
  adminCreatePage, 
  adminUpdatePage, 
  adminDeletePage, 
  PageSummaryDTO,
  CreatePageRequest
} from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash2, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PagesDashboard() {
  const [pages, setPages] = useState<PageSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageSummaryDTO | null>(null);
  const [formData, setFormData] = useState<CreatePageRequest>({
    name: "",
    slug: "",
    active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      setLoading(true);
      const data = await adminFetchPages();
      setPages(data);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải danh sách trang");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(page?: PageSummaryDTO) {
    if (page) {
      setEditingPage(page);
      setFormData({
        name: page.name,
        slug: page.slug,
        active: page.active
      });
    } else {
      setEditingPage(null);
      setFormData({
        name: "",
        slug: "",
        active: true
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Vui lòng điền đầy đủ tên và đường dẫn!");
      return;
    }
    
    // Normalize slug
    const normalizedSlug = formData.slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-");
    const payload = {
      ...formData,
      slug: normalizedSlug
    };

    try {
      setSaving(true);
      if (editingPage) {
        await adminUpdatePage(editingPage.id, payload);
        toast.success("Cập nhật trang thành công!");
      } else {
        await adminCreatePage(payload);
        toast.success("Tạo trang mới thành công!");
      }
      setDialogOpen(false);
      loadPages();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu trang");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePage(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa trang này và toàn bộ các section bên trong?")) {
      return;
    }
    try {
      await adminDeletePage(id);
      toast.success("Xóa trang thành công!");
      loadPages();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa trang");
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Giao diện</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các trang động (Dynamic Pages) và cấu trúc giao diện của chúng.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Thêm trang mới
        </Button>
      </div>

      {error && <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded">{error}</div>}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên Trang</TableHead>
              <TableHead>Đường dẫn (Slug)</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Chưa có trang nào. Vui lòng bấm "Thêm trang mới".
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">#{page.id}</TableCell>
                  <TableCell className="font-bold">{page.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">/{page.slug}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.active ? "default" : "secondary"}>
                      {page.active ? "Hoạt động" : "Tạm ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(page.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/pages/${page.id}?name=${encodeURIComponent(page.name)}`}>
                      <Button variant="outline" size="sm">
                        <LayoutGrid className="h-4 w-4 mr-1" /> Sửa bố cục
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(page)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePage(page.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Chỉnh sửa trang" : "Tạo trang động mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên trang</Label>
              <Input 
                id="name"
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="VD: Trang chủ, Khuyến mãi hè"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Đường dẫn (Slug)</Label>
              <Input 
                id="slug"
                value={formData.slug} 
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                placeholder="VD: home, summer-sale"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Dùng làm URL. Chỉ chấp nhận chữ thường không dấu, số và dấu gạch ngang (ví dụ: `summer-sale`).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="active">Trạng thái hoạt động</Label>
              <Select 
                value={formData.active ? "true" : "false"} 
                onValueChange={(val) => setFormData({ ...formData, active: val === "true" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động (Active)</SelectItem>
                  <SelectItem value="false">Tạm ẩn (Inactive)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu lại
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
