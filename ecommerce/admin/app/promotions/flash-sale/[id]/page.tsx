"use client";

import { useState, useEffect, use } from "react";
import { fetchActiveFlashSales, addFlashSaleVariant, FlashSaleResponse, FlashSaleProductResponse, fetchProducts, Product } from "@/lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { ChevronLeft, Plus, Search, Tag } from "lucide-react";

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
import { Progress } from "@/components/ui/progress";

export default function FlashSaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const flashSaleId = Number(resolvedParams.id);

  const [flashSale, setFlashSale] = useState<FlashSaleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const [formData, setFormData] = useState({
    salePrice: 0,
    quantity: 0,
    maxPerUser: 1,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchActiveFlashSales();
      const current = data.find(s => s.id === flashSaleId);
      if (current) setFlashSale(current);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải chi tiết Flash Sale",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchProducts({ keyword: search });
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [flashSaleId]);

  useEffect(() => {
    if (isAddOpen) {
      loadProducts();
    }
  }, [isAddOpen, search]);

  const handleAdd = async () => {
    try {
      if (!selectedVariant || formData.salePrice <= 0 || formData.quantity <= 0 || formData.maxPerUser <= 0) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng điền thông tin hợp lệ",
        });
        return;
      }

      if (formData.quantity > selectedVariant.stock) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: `Số lượng không được vượt quá tồn kho thực tế (${selectedVariant.stock})`,
        });
        return;
      }

      if (selectedVariant.costPrice && formData.salePrice < selectedVariant.costPrice) {
        if (!confirm(`Giá Sale (${formData.salePrice.toLocaleString("vi-VN")}đ) đang thấp hơn giá nhập (${selectedVariant.costPrice.toLocaleString("vi-VN")}đ). Bạn có chắc chắn muốn chịu lỗ không?`)) {
          return;
        }
      }

      await addFlashSaleVariant(flashSaleId, {
        variantId: selectedVariant.id,
        salePrice: Number(formData.salePrice),
        quantity: Number(formData.quantity),
        maxPerUser: Number(formData.maxPerUser),
      });

      toast({
        title: "Thành công",
        description: "Đã thêm sản phẩm vào đợt Flash Sale",
      });
      setIsAddOpen(false);
      setSelectedVariant(null);
      setFormData({ salePrice: 0, quantity: 0, maxPerUser: 1 });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi thêm sản phẩm",
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Đang tải...</div>;
  if (!flashSale) return <div className="p-8 text-center text-red-500">Không tìm thấy Flash Sale</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/promotions/flash-sale">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{flashSale.name}</h1>
          <p className="text-muted-foreground">
            Từ {format(new Date(flashSale.startTime), "HH:mm dd/MM/yyyy", { locale: vi })} đến {format(new Date(flashSale.endTime), "HH:mm dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sản phẩm trong chương trình ({flashSale.products?.length || 0})</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm vào Flash Sale</DialogTitle>
              <DialogDescription>
                Tìm kiếm và chọn biến thể sản phẩm, sau đó thiết lập giá và số lượng khuyến mãi.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Left Column: Search & Select */}
              <div className="space-y-4 border-r pr-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm sản phẩm..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="h-[300px] overflow-y-auto space-y-2 pr-2">
                  {products.map(p => (
                    <div key={p.id} className="space-y-1 p-2 border rounded-md bg-muted/20">
                      <p className="font-medium text-sm">{p.name}</p>
                      <div className="grid grid-cols-1 gap-1">
                        {p.variants.map(v => (
                          <div
                            key={v.id}
                            className={`text-xs p-3 rounded-md cursor-pointer border flex flex-col gap-1 transition-all ${selectedVariant?.id === v.id ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-background hover:bg-muted/50'}`}
                            onClick={() => {
                              setSelectedVariant(v);
                              setFormData(prev => ({ ...prev, salePrice: v.price }));
                            }}
                          >
                            <div className="flex justify-between font-semibold">
                              <span>SKU: {v.sku}</span>
                              <span className="text-primary">{v.price.toLocaleString("vi-VN")}đ</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Tồn: <span className={v.stock > 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>{v.stock}</span></span>
                              <span>Giá nhập: {v.costPrice ? `${v.costPrice.toLocaleString("vi-VN")}đ` : "N/A"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Configuration */}
              <div className="space-y-4 pl-2">
                {selectedVariant ? (
                  <>
                    <div className="p-3 bg-muted rounded-md mb-4 border">
                      <p className="text-sm font-semibold mb-2">Đang chọn: <span className="text-primary">{selectedVariant.sku}</span></p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Giá gốc:</span>
                          <span className="font-medium">{selectedVariant.price.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Giá nhập:</span>
                          <span className="font-medium">{selectedVariant.costPrice ? `${selectedVariant.costPrice.toLocaleString("vi-VN")}đ` : "N/A"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Tồn kho hiện tại:</span>
                          <span className="font-medium text-blue-600">{selectedVariant.stock} sản phẩm</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 relative">
                      <Label className={selectedVariant.costPrice && formData.salePrice < selectedVariant.costPrice ? "text-orange-500" : ""}>Giá Khuyến Mãi (VNĐ)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={formData.salePrice}
                        className={selectedVariant.costPrice && formData.salePrice < selectedVariant.costPrice ? "border-orange-500 focus-visible:ring-orange-500" : ""}
                        onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                      />
                      {selectedVariant.costPrice && formData.salePrice < selectedVariant.costPrice && (
                        <p className="text-xs text-orange-500 font-medium bg-orange-50 p-2 rounded-md border border-orange-200">
                          ⚠️ Giá Sale đang thấp hơn Giá nhập. Đơn hàng sẽ bị lỗ !
                        </p>
                      )}
                      {formData.salePrice >= selectedVariant.price && (
                        <p className="text-xs text-destructive font-medium">
                          ❌ Giá Sale phải thấp hơn Giá gốc ({selectedVariant.price.toLocaleString("vi-VN")}đ)
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 relative">
                      <Label className={formData.quantity > selectedVariant.stock ? "text-destructive" : ""}>Số lượng (Kho Flash Sale)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.quantity}
                        className={formData.quantity > selectedVariant.stock ? "border-destructive focus-visible:ring-destructive" : ""}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      />
                      {formData.quantity > selectedVariant.stock ? (
                        <p className="text-xs text-destructive font-bold bg-red-50 p-2 rounded-md border border-red-200">
                          ❌ Vượt quá tồn kho thực tế! Chỉ còn {selectedVariant.stock} SP.
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">Lưu ý: Không vượt quá tồn kho thực tế ({selectedVariant.stock})</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Giới hạn mua / 1 Khách hàng</Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.maxPerUser}
                        onChange={(e) => setFormData({ ...formData, maxPerUser: Number(e.target.value) })}
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Vui lòng chọn 1 biến thể sản phẩm ở cột bên trái
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
              <Button
                onClick={handleAdd}
                disabled={!selectedVariant || formData.quantity > selectedVariant.stock || formData.salePrice >= selectedVariant.price}
              >
                Thêm vào Flash Sale
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm (SKU)</TableHead>
              <TableHead>Giá Gốc</TableHead>
              <TableHead>Giá Sale</TableHead>
              <TableHead>Tổng SP Sale</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Max/User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flashSale.products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Chưa có sản phẩm nào trong chương trình này.
                </TableCell>
              </TableRow>
            ) : (
              flashSale.products?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {item.image && (
                        <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img src={item.image} alt="" className="object-cover w-full h-full" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium line-clamp-1 max-w-[200px]" title={item.productName}>{item.productName}</p>
                        <p className="text-xs text-muted-foreground">ID Variant: {item.variantId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="line-through text-muted-foreground">
                    {item.originalPrice?.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell className="font-bold text-red-500">
                    {item.salePrice?.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="w-[200px]">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Đã bán {item.soldQuantity}</span>
                        <span className="font-medium">{Math.round((item.soldQuantity / item.quantity) * 100)}%</span>
                      </div>
                      <Progress value={(item.soldQuantity / item.quantity) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>{item.maxPerUser}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
