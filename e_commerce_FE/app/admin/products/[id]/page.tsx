"use client";

import { useState, use, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  GripVertical,
  Upload,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  fetchProductById, 
  fetchCategories, 
  fetchBrands,
  adminCreateProduct, 
  adminUpdateProduct, 
  adminDeleteProduct,
  fetchAttributes,
  type ProductRequest,
  type Brand,
  type Attribute
} from "@/lib/api";
import { toast } from "sonner";
import type { Category, Product, ProductVariant } from "@/lib/data";
import { type AttributeValue } from "@/lib/api";

export default function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    categoryId: number;
    brandId: number;
      variants: {
        id?: number;
        sku: string;
        price: number; // Giá gốc
        discountPrice: number; // Giá bán
        compareAtPrice: number;
        costPrice: number;
        stock: number;
        imageUrl: string;
        attributeValueIds: number[];
      }[];
  }>({
    name: "",
    description: "",
    categoryId: 0,
    brandId: 0,
    variants: [{ sku: "", price: 0, discountPrice: 0, compareAtPrice: 0, costPrice: 0, stock: 0, imageUrl: "", attributeValueIds: [] }],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [cats, brs, attrs] = await Promise.all([
          fetchCategories(), 
          fetchBrands(),
          fetchAttributes()
        ]);
        setCategories(cats);
        setBrands(brs);
        setAllAttributes(attrs);

        if (!isNew) {
          const prod = await fetchProductById(Number(id));
          setProduct(prod);
          setFormData({
            name: prod.name,
            description: prod.description || "",
            categoryId: Number(prod.categoryId),
            brandId: Number(prod.brandId),
            variants: prod.variants.map(v => ({
              id: Number(v.id),
              sku: v.sku,
              price: v.compareAtPrice || v.price, // Giá gốc
              discountPrice: v.discountPrice || 0, // Giá bán
              compareAtPrice: v.compareAtPrice || 0,
              costPrice: v.costPrice || 0,
              stock: v.inventory,
              imageUrl: v.imageUrl || "",
              attributeValueIds: [], 
            })),
          });
          if (prod.images && prod.images.length > 0) {
            setPreviewUrl(prod.images[0].url);
          }
        }
      } catch (error) {
        toast.error("Không thể tải thông tin sản phẩm");
        router.push("/admin/products");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, isNew, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.categoryId || !formData.brandId) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc (Tên, Danh mục, Thương hiệu)");
      return;
    }

    if (formData.variants.length === 0) {
      toast.error("Vui lòng thêm ít nhất một phiên bản");
      return;
    }

    const requestData: ProductRequest = {
      name: formData.name,
      description: formData.description,
      categoryId: formData.categoryId,
      brandId: formData.brandId,
      variants: formData.variants.map(v => ({
        id: v.id,
        sku: v.sku || undefined,
        price: v.price, // Gốc
        discountPrice: v.discountPrice || undefined, // Bán
        compareAtPrice: v.compareAtPrice || undefined,
        costPrice: v.costPrice || undefined,
        stock: v.stock,
        imageUrl: v.imageUrl || undefined,
        attributeValueIds: v.attributeValueIds.length > 0 ? v.attributeValueIds : undefined,
      }))
    };

    setIsSaving(true);
    try {
      if (isNew) {
        await adminCreateProduct(requestData, imageFile || undefined);
        toast.success("Đã tạo sản phẩm thành công");
      } else {
        await adminUpdateProduct(Number(id), requestData, imageFile || undefined);
        toast.success("Đã cập nhật sản phẩm thành công");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(isNew ? "Tạo sản phẩm thất bại" : "Cập nhật sản phẩm thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { sku: "", price: 0, discountPrice: 0, compareAtPrice: 0, costPrice: 0, stock: 0, imageUrl: "", attributeValueIds: [] }],
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 1) {
      toast.error("Phải có ít nhất một phiên bản");
      return;
    }
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleDelete = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await adminDeleteProduct(Number(id));
        toast.success("Đã xóa sản phẩm thành công");
        router.push("/admin/products");
      } catch (error) {
        toast.error("Xóa sản phẩm thất bại");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {isNew ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? "Tạo sản phẩm mới cho cửa hàng"
                : `Chỉnh sửa: ${product?.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="outline" asChild>
              <Link href={`/product/${product?.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Xem trang
              </Link>
            </Button>
          )}
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isNew ? "Tạo sản phẩm" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="images">Hình ảnh</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên sản phẩm *</Label>
                    <Input
                      id="name"
                      placeholder="VD: Serum Vitamin C 20%"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Danh mục *</Label>
                      <Select
                        value={String(formData.categoryId)}
                        onValueChange={(value) =>
                          setFormData({ ...formData, categoryId: Number(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 pt-0">
                            <Input
                              placeholder="Tìm danh mục..."
                              className="h-8 text-xs"
                              value={categorySearch}
                              onChange={(e) => setCategorySearch(e.target.value)}
                            />
                          </div>
                          {categories
                            .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                            .map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.parentId ? "— " : ""}{cat.name}
                              </SelectItem>
                            ))}
                          {categories.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                            <div className="p-2 text-xs text-center text-muted-foreground">
                              Không tìm thấy danh mục
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Thương hiệu *</Label>
                      <Select
                        value={String(formData.brandId)}
                        onValueChange={(value) =>
                          setFormData({ ...formData, brandId: Number(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thương hiệu" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 pt-0">
                            <Input
                              placeholder="Tìm thương hiệu..."
                              className="h-8 text-xs"
                              value={brandSearch}
                              onChange={(e) => setBrandSearch(e.target.value)}
                            />
                          </div>
                          {brands
                            .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                            .map((brand) => (
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          {brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase())).length === 0 && (
                            <div className="p-2 text-xs text-center text-muted-foreground">
                              Không tìm thấy thương hiệu
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả sản phẩm *</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả về sản phẩm..."
                      rows={5}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">Phiên bản sản phẩm (Variants)</CardTitle>
                  <Button variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm phiên bản
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Phiên bản #{index + 1}</h4>
                        {formData.variants.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeVariant(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-5">
                        <div className="space-y-2">
                          <Label>Mã SKU</Label>
                          <Input
                            placeholder="VD: SKU-001"
                            value={variant.sku}
                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Giá gốc *</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, "price", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Giá bán</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={variant.discountPrice}
                            onChange={(e) => updateVariant(index, "discountPrice", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Giá nhập</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={variant.costPrice}
                            onChange={(e) => updateVariant(index, "costPrice", Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tồn kho *</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, "stock", Number(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Ảnh phiên bản (URL)</Label>
                          <div className="flex gap-2">
                             <Input 
                               placeholder="https://..."
                               value={variant.imageUrl}
                               onChange={(e) => updateVariant(index, "imageUrl", e.target.value)}
                             />
                             {variant.imageUrl && (
                               <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border">
                                 <Image src={variant.imageUrl} fill alt="v" className="object-cover" />
                               </div>
                             )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Thuộc tính (Size, Color...)</Label>
                          <div className="flex flex-wrap gap-2">
                            {allAttributes.map(attr => (
                              <div key={attr.id} className="flex items-center gap-1 border rounded px-2 py-1 bg-muted/30">
                                <span className="text-xs font-semibold">{attr.name}:</span>
                                <select 
                                  className="text-xs bg-transparent border-none focus:ring-0 cursor-pointer"
                                  value={variant.attributeValueIds.find(id => attr.values.some(v => v.id === id)) || ""}
                                  onChange={(e) => {
                                    const valId = Number(e.target.value);
                                    // Remove old value for this attribute
                                    const filteredIds = variant.attributeValueIds.filter(id => !attr.values.some(v => v.id === id));
                                    if (valId) {
                                      updateVariant(index, "attributeValueIds", [...filteredIds, valId]);
                                    } else {
                                      updateVariant(index, "attributeValueIds", filteredIds);
                                    }
                                  }}
                                >
                                  <option value="">Chọn...</option>
                                  {attr.values.map(val => (
                                    <option key={val.id} value={val.id}>{val.value}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                            {allAttributes.length === 0 && (
                                <span className="text-xs text-muted-foreground italic">Chưa có thuộc tính nào để chọn</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hình ảnh sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {previewUrl && (
                      <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setPreviewUrl(null);
                              setImageFile(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {!previewUrl && (
                      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted">
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Tải hình lên
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Định dạng: JPG, PNG, WebP. Tối đa 5MB.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sẵn sàng bán</p>
                  <p className="text-sm text-muted-foreground">
                    Dựa trên số lượng tồn kho
                  </p>
                </div>
                <Badge
                  variant={formData.variants.reduce((acc, v) => acc + (v.stock || 0), 0) > 0 ? "default" : "secondary"}
                  className={
                    formData.variants.reduce((acc, v) => acc + (v.stock || 0), 0) > 0 ? "bg-success text-white" : ""
                  }
                >
                  {formData.variants.reduce((acc, v) => acc + (v.stock || 0), 0) > 0 ? "Đang bán" : "Hết hàng"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tóm tắt tồn kho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tổng số phiên bản:</span>
                  <span className="font-medium">{formData.variants.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tổng tồn kho:</span>
                  <span className="font-medium">{formData.variants.reduce((acc, v) => acc + (v.stock || 0), 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Giá cao nhất:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      Math.max(...formData.variants.map(v => v.price), 0)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Giá trung bình:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      formData.variants.reduce((acc, v) => acc + v.price, 0) / (formData.variants.length || 1)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isNew && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Khu vực nguy hiểm</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Xóa sản phẩm này sẽ không thể khôi phục lại được.
                </p>
                <Button variant="destructive" className="w-full" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa sản phẩm
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
