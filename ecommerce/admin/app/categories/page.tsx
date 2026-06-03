"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronDown,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  type CategoryRequest,
  fetchBrands
} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/data";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const [formData, setFormData] = useState<CategoryRequest>({
    name: "",
    description: "",
    parentId: null,
  });

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        parentId: category.parentId ? Number(category.parentId) : null,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        parentId: null,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await adminUpdateCategory(Number(editingCategory.id), formData);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await adminCreateCategory(formData);
        toast.success("Thêm danh mục mới thành công");
      }
      setIsDialogOpen(false);
      loadCategories();
    } catch (error) {
      toast.error("Lưu danh mục thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteCategory(Number(id));
      toast.success("Đã xóa danh mục");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setCategoryToDelete(null);
    } catch (error) {
      toast.error("Xóa danh mục thất bại");
    }
  };

  // Filter logic: show if name matches OR if it's a child of a visible expanded parent
  const filteredCategories = categories.filter((cat) => {
    if (searchQuery) {
      return cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    // In flat list, parentId belongs to parent that must be expanded
    if (!cat.parentId) return true;
    
    // Check if ALL ancestors are expanded
    let currentParentId: string | undefined = cat.parentId;
    while (currentParentId) {
      if (!expandedIds.has(currentParentId)) return false;
      const parent = categories.find(c => c.id === currentParentId);
      currentParentId = parent?.parentId;
    }
    return true;
  });

  const getParentName = (parentId?: string) => {
    return categories.find(c => c.id === parentId)?.name || "—";
  };

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Danh mục
          </h1>
          <p className="text-muted-foreground">
            Quản lý các danh mục sản phẩm của cửa hàng
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Tên danh mục</TableHead>
                    <TableHead className="w-[40%]">Mô tả</TableHead>
                    <TableHead className="text-right">Sản phẩm</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Không tìm thấy danh mục nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => {
                      const hasChildren = categories.some(c => c.parentId === category.id);
                      const isExpanded = expandedIds.has(category.id);
                      const level = category.level || 0;

                      return (
                        <TableRow key={category.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium p-0">
                             <div 
                               className="flex items-center"
                               style={{ paddingLeft: `${level * 24 + 12}px` }}
                             >
                                <div className="flex items-center h-12 w-full gap-2 py-2">
                                  {/* Guide line for nested items */}
                                  {level > 0 && (
                                    <div className="absolute left-0 top-0 bottom-0 border-l border-muted-foreground/20" 
                                         style={{ left: `${(level - 1) * 24 + 23}px` }} 
                                    />
                                  )}
                                  
                                  {hasChildren ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 p-0 hover:bg-muted"
                                      onClick={() => toggleExpand(category.id)}
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </Button>
                                  ) : (
                                    <div className="w-6" /> // Spacer for alignment
                                  )}
                                  
                                  {level > 0 ? (
                                    <FolderTree className="h-4 w-4 text-muted-foreground/60" />
                                  ) : (
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                  
                                  <span className="truncate">{category.name}</span>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-md truncate">
                            {category.description || "Không có mô tả"}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {category.productCount || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(category)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setCategoryToDelete(category)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết cho danh mục sản phẩm của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Chăm sóc da"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Danh mục cha</Label>
              <Select
                value={formData.parentId?.toString() || "none"}
                onValueChange={(val) => setFormData({ ...formData, parentId: val === "none" ? null : Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Không có (Danh mục gốc)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có (Danh mục gốc)</SelectItem>
                  {categories
                    .filter(c => c.id !== editingCategory?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.level ? "  ".repeat(cat.level) + "- " : ""}{cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về danh mục này..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Danh mục{" "}
              <span className="font-semibold text-foreground">
                {categoryToDelete?.name}
              </span>{" "}
              sẽ bị xóa vĩnh viễn. Các sản phẩm trong danh mục này sẽ không bị xóa nhưng sẽ mất liên kết danh mục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => categoryToDelete && handleDelete(categoryToDelete.id)}
            >
              Xóa danh mục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
