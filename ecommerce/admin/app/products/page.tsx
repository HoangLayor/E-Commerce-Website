"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
  Loader2,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchProductsPage, fetchCategories, adminDeleteProduct, adminExportProductsExcel, adminImportProductsExcel } from "@/lib/api";
import type { Product, Category } from "@/lib/data";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "d";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Export/Import states & handlers
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await adminExportProductsExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Danh_sach_san_pham_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      toast.error("Không thể xuất file Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const msg = await adminImportProductsExcel(file);
      toast.success(msg || "Nhập file Excel thành công!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Nhập file Excel thất bại");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: any = { page: currentPage, size: pageSize };
      if (searchQuery) filters.keyword = searchQuery;
      if (categoryFilter !== "all") filters.categoryIds = [Number(categoryFilter)];

      const [productsPage, categoriesData] = await Promise.all([
        fetchProductsPage(filters),
        fetchCategories(),
      ]);
      setProducts(productsPage.content);
      setTotalPages(productsPage.totalPages);
      setTotalElements(productsPage.totalElements);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Không thể tải dữ liệu sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, categoryFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, categoryFilter]);

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteProduct(Number(id));
      toast.success("Đã xóa sản phẩm thành công");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setProductToDelete(null);
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại");
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Sản phẩm
          </h1>
          <p className="text-muted-foreground">
            Quản lý tất cả sản phẩm trong cửa hàng
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden Import Input */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleImport}
              disabled={isImporting}
            />
            <Button variant="outline" className="flex items-center gap-2" asChild disabled={isImporting}>
              <span>
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Nhập Excel
              </span>
            </Button>
          </label>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Xuất Excel
          </Button>

          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" asChild>
            <Link href="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {selectedProducts.length > 0 && (
                <div className="mb-4 flex items-center gap-4 rounded-lg bg-muted p-3">
                  <span className="text-sm">
                    Đã chọn {selectedProducts.length} sản phẩm
                  </span>
                  <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
                    Xuất Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    Xóa
                  </Button>
                </div>
              )}

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedProducts.length === products.length &&
                            products.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Tồn kho</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Không tìm thấy sản phẩm nào.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() => toggleSelect(product.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                                <Image
                                  src={product.images[0]?.url || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {product.variants?.length || 0} biến thể
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.sku}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {formatCurrency(product.price)}
                              </p>
                              {product.compareAtPrice && (
                                <p className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(product.compareAtPrice)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                (product.inventory?.quantity || 0) < 10
                                  ? "text-warning font-medium"
                                  : ""
                              }
                            >
                              {product.inventory?.quantity || 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.inventory?.available ? "default" : "secondary"
                              }
                              className={
                                product.inventory?.available
                                  ? "bg-success text-white"
                                  : ""
                              }
                            >
                              {product.inventory?.available ? "Còn hàng" : "Hết hàng"}
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
                                <DropdownMenuItem asChild>
                                  <Link href={`/product/${product.slug}`} target="_blank">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/products/${product.id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onSelect={() => setProductToDelete(product)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Hiển thị {totalElements === 0 ? 0 : currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} trên tổng số {totalElements} sản phẩm
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Trước
                  </Button>
                  <span className="text-sm font-medium text-foreground mx-2">
                    Trang {currentPage + 1} / {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Sản phẩm{" "}
              <span className="font-semibold text-foreground">
                {productToDelete?.name}
              </span>{" "}
              sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => productToDelete && handleDelete(productToDelete.id)}
            >
              Xóa sản phẩm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
