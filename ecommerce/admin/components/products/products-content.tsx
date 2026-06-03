"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Filter, SlidersHorizontal, Grid3X3, LayoutGrid, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductCard } from "@/components/product/product-card";
import { fetchProductsPage, fetchCategories, fetchBrands, fetchAttributes, type Attribute } from "@/lib/api";
import { type Brand } from "@/lib/api";
import { formatPrice, type Product, type Category } from "@/lib/data";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buildCategoryTree } from "@/lib/utils";

const skinTypes = [
  { id: "all", label: "Tất cả loại da" },
  { id: "oily", label: "Da dầu" },
  { id: "dry", label: "Da khô" },
  { id: "combination", label: "Da hỗn hợp" },
  { id: "normal", label: "Da thường" },
  { id: "sensitive", label: "Da nhạy cảm" },
];

const sortOptions = [
  { value: "id-desc", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
  { value: "name-asc", label: "Tên: A-Z" },
];

interface ProductsContentProps {
  initialCategoryId?: string;
  showBreadcrumb?: boolean;
}

export function ProductsContent({ initialCategoryId, showBreadcrumb = true }: ProductsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL state
  const page = parseInt(searchParams.get("page") || "1") - 1;
  const sortBy = searchParams.get("sort") || "id-desc";
  
  // Parse comma-separated IDs from URL
  const categoryIds = (searchParams.get("category") || initialCategoryId || "").split(",").filter(Boolean).map(Number);
  const brandIds = (searchParams.get("brand") || "").split(",").filter(Boolean).map(Number);
  const attributeValueIds = (searchParams.get("skinType") || "").split(",").filter(Boolean).map(Number);
  
  const minPrice = searchParams.has("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.has("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const keyword = searchParams.get("q") || undefined;

  // Local state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([0, 5000000]);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  // Sync open categories with initial selection
  useEffect(() => {
    if (categoryIds.length > 0) {
      setOpenCategories(prev => {
        const newIds = categoryIds.map(String);
        const combined = new Set([...prev, ...newIds]);
        return Array.from(combined);
      });
    }
  }, []); // Only on first load
  useEffect(() => {
    if (minPrice !== undefined || maxPrice !== undefined) {
      setLocalPriceRange([minPrice || 0, maxPrice || 5000000]);
    }
  }, [minPrice, maxPrice]);

  const updateFilters = useCallback((newParams: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });

    // Reset page on filter change
    if (!newParams.page) {
      current.delete("page");
    }

    startTransition(() => {
      // Always use scroll: false and handle scrolling manually if needed to avoid jumps
      router.push(`${pathname}?${current.toString()}`, { scroll: false });
    });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [pageData, categoriesData, brandsData, attributesData] = await Promise.all([
          fetchProductsPage({
            page,
            size: 24,
            sortBy: sortBy.split("-")[0],
            sortDir: sortBy.split("-")[1],
            categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
            brandIds: brandIds.length > 0 ? brandIds : undefined,
            attributeValueIds: attributeValueIds.length > 0 ? attributeValueIds : undefined,
            minPrice,
            maxPrice,
            keyword,
          }),
          fetchCategories(),
          fetchBrands(),
          fetchAttributes(),
        ]);

        setProducts(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
        setCategories(categoriesData);
        setBrands(brandsData);
        setAttributes(attributesData);
      } catch (error) {
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [page, sortBy, categoryIds.join(","), brandIds.join(","), attributeValueIds.join(","), minPrice, maxPrice, keyword]);

  const activeFiltersCount = 
    (categoryIds.length > 0 && categoryIds[0] !== Number(initialCategoryId) ? categoryIds.length : 0) + 
    brandIds.length +
    attributeValueIds.length +
    (minPrice !== undefined || maxPrice !== undefined ? 1 : 0);

  const clearAllFilters = () => {
    updateFilters({
      category: initialCategoryId,
      brand: undefined,
      skinType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      page: undefined,
    });
  };

  const toggleFilter = (key: string, id: number) => {
    const currentIds = (searchParams.get(key) || "").split(",").filter(Boolean).map(Number);
    const newIds = currentIds.includes(id) 
      ? currentIds.filter(i => i !== id) 
      : [...currentIds, id];
    
    updateFilters({ [key]: newIds.length > 0 ? newIds.join(",") : undefined });
  };

  const handleCategoryToggle = (category: Category, checked: boolean | string) => {
    const currentIds = new Set((searchParams.get("category") || "").split(",").filter(Boolean).map(Number));
    const isChecked = checked === true;
    
    // Recursive function to find all child IDs in the flat categories list
    const getDescendantIds = (parentId: string, allCats: Category[]): number[] => {
      let ids: number[] = [Number(parentId)];
      const children = allCats.filter(c => String(c.parentId) === parentId);
      children.forEach(child => {
        ids = [...ids, ...getDescendantIds(child.id, allCats)];
      });
      return ids;
    };

    const descendantIds = getDescendantIds(category.id, categories);

    if (isChecked) {
      descendantIds.forEach(id => currentIds.add(id));
    } else {
      // Unchecking: Remove the category and all its descendants
      descendantIds.forEach(id => currentIds.delete(id));
      
      // Also recursively remove all parent IDs since the full branch is no longer selected
      let currentParentId = category.parentId;
      while (currentParentId) {
        currentIds.delete(Number(currentParentId));
        const parentCat = categories.find(c => String(c.id) === String(currentParentId));
        currentParentId = parentCat?.parentId;
      }
    }

    const newIdsArray = Array.from(currentIds);
    updateFilters({ category: newIdsArray.length > 0 ? newIdsArray.join(",") : undefined });
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage + 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryTree = buildCategoryTree(categories);

  const FiltersContent = () => (
    <div className="space-y-6 pb-8">
      {/* Categories */}
      {!initialCategoryId && (
        <div className="space-y-3">
          <h3 className="font-semibold px-1 text-base">Danh mục</h3>
          <Accordion 
            type="multiple" 
            value={openCategories} 
            onValueChange={setOpenCategories} 
            className="w-full"
          >
            {categoryTree.map((category) => (
              <AccordionItem key={category.id} value={String(category.id)} className="border-none">
                <div className="flex items-center gap-2 group py-1">
                    <Checkbox
                    id={`cat-${category.id}`}
                    checked={categoryIds.includes(Number(category.id))}
                    onCheckedChange={(checked) => handleCategoryToggle(category, checked)}
                    className="rounded-sm border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  {category.children && category.children.length > 0 ? (
                    <AccordionTrigger className="flex-1 py-1 px-1 hover:no-underline hover:text-primary transition-all text-sm font-medium">
                      <span className="flex-1 text-left">{category.name}</span>
                      <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded-full font-normal text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {category.productCount}
                      </span>
                    </AccordionTrigger>
                  ) : (
                    <Label 
                      htmlFor={`cat-${category.id}`}
                      className="flex-1 py-1 px-1 cursor-pointer text-sm font-medium hover:text-primary transition-colors flex items-center justify-between"
                    >
                      {category.name}
                      <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded-full font-normal text-muted-foreground">
                        {category.productCount}
                      </span>
                    </Label>
                  )}
                </div>
                {category.children && category.children.length > 0 && (
                  <AccordionContent className="pb-1 pt-0">
                    <div className="pl-6 space-y-1 mt-1 border-l border-muted/30 ml-2">
                      {category.children.map((child) => (
                        <div key={child.id} className="flex items-center gap-2 py-1 group/child">
                          <Checkbox
                            id={`cat-${child.id}`}
                            checked={categoryIds.includes(Number(child.id))}
                            onCheckedChange={(checked) => handleCategoryToggle(child, checked)}
                            className="rounded-sm border-muted-foreground/20 data-[state=checked]:bg-primary/80 data-[state=checked]:border-primary/80 scale-90"
                          />
                          <Label 
                            htmlFor={`cat-${child.id}`}
                            className="flex-1 cursor-pointer text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-between"
                          >
                            {child.name}
                            <span className="text-[9px] opacity-60">
                              ({child.productCount})
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4 pt-4 border-t border-muted/20">
        <h3 className="font-semibold px-1">Khoảng giá</h3>
        <div className="px-2">
          <Slider
            value={localPriceRange}
            onValueChange={(value) => setLocalPriceRange(value as [number, number])}
            onValueCommit={(value) => {
              updateFilters({ 
                minPrice: value[0] === 0 ? undefined : value[0], 
                maxPrice: value[1] === 5000000 ? undefined : value[1] 
              });
            }}
            max={5000000}
            step={50000}
            className="mb-6"
          />
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 px-1">Từ</span>
              <div className="relative group">
                <Input 
                  type="number" 
                  value={localPriceRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLocalPriceRange([val, localPriceRange[1]]);
                  }}
                  onBlur={() => {
                    updateFilters({ minPrice: localPriceRange[0] === 0 ? undefined : localPriceRange[0] });
                  }}
                  className="h-9 px-2 text-xs font-semibold bg-muted/40 rounded-lg border-border/50 focus:bg-background transition-all"
                />
              </div>
            </div>
            <div className="pt-6 text-muted-foreground/30">—</div>
            <div className="flex-1 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 px-1">Đến</span>
              <div className="relative group">
                <Input 
                  type="number" 
                  value={localPriceRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLocalPriceRange([localPriceRange[0], val]);
                  }}
                  onBlur={() => {
                    updateFilters({ maxPrice: localPriceRange[1] === 5000000 ? undefined : localPriceRange[1] });
                  }}
                  className="h-9 px-2 text-xs font-semibold bg-muted/40 rounded-lg border-border/50 focus:bg-background transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3 pt-4 border-t border-muted/20">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold">Thương hiệu</h3>
          {brandIds.length > 0 && (
            <Badge variant="secondary" className="px-1.5 h-4 text-[10px] bg-primary/10 text-primary border-none">
              {brandIds.length}
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[180px] px-1">
          <div className="space-y-1">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center gap-2 py-1.5 px-1 group">
                <Checkbox 
                  id={`brand-${brand.id}`} 
                  checked={brandIds.includes(brand.id)}
                  onCheckedChange={() => toggleFilter("brand", brand.id)}
                  className="rounded-sm border-muted-foreground/30" 
                />
                <Label 
                  htmlFor={`brand-${brand.id}`} 
                  className="text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                >
                  {brand.name}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Skin Type */}
      <div className="space-y-3 pt-4 border-t border-muted/20">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold">Loại da</h3>
          {attributeValueIds.length > 0 && (
            <Badge variant="secondary" className="px-1.5 h-4 text-[10px] bg-primary/10 text-primary border-none">
              {attributeValueIds.length}
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[150px] px-1">
          <div className="space-y-1">
            {attributes.find(attr => attr.name === "Loại da")?.values.map((val) => (
              <div key={val.id} className="flex items-center gap-2 py-1.5 px-1 group">
                <Checkbox 
                  id={`skin-${val.id}`} 
                  checked={attributeValueIds.includes(val.id)}
                  onCheckedChange={() => toggleFilter("skinType", val.id)}
                  className="rounded-sm border-muted-foreground/30" 
                />
                <Label 
                  htmlFor={`skin-${val.id}`} 
                  className="text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                >
                  {val.value}
                </Label>
              </div>
            )) || (
              <div className="text-xs text-muted-foreground italic px-1">Đang tải...</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full bg-white/50 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all rounded-xl mt-6 font-semibold shadow-sm"
          onClick={clearAllFilters}
        >
          Xóa tất cả bộ lọc
        </Button>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-background via-primary-light/8 to-secondary/8 min-h-screen pb-16">
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tất cả sản phẩm</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        {!initialCategoryId && (
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
              Tất Cả Sản Phẩm
            </h1>
            <p className="text-muted-foreground">
              Khám phá bộ sưu tập mỹ phẩm chính hãng chất lượng cao
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold flex items-center gap-2 text-lg">
                  <Filter className="h-4 w-4 text-primary" />
                  Bộ lọc
                </h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <FiltersContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-border/50">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden bg-white/50 backdrop-blur-sm rounded-xl">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Bộ lọc
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-2" variant="secondary">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="text-left font-serif text-2xl">Bộ lọc</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 px-1">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  Đang hiển thị <span className="font-bold text-foreground">{totalElements}</span> sản phẩm
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <Select value={sortBy} onValueChange={(val) => updateFilters({ sort: val })}>
                  <SelectTrigger className="w-[180px] bg-white/50 backdrop-blur-sm rounded-xl border-border/50">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Grid Toggle - Desktop Only */}
                <div className="hidden md:flex bg-white/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden p-0.5">
                  <Button
                    variant={gridCols === 3 ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-lg h-8 w-8 transition-all"
                    onClick={() => setGridCols(3)}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={gridCols === 4 ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-lg h-8 w-8 transition-all"
                    onClick={() => setGridCols(4)}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {/* Active Filters Pills */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {brandIds.map(id => {
              const brand = brands.find(b => b.id === id);
              if (!brand) return null;
              return (
                <Badge key={`pill-brand-${id}`} variant="outline" className="pl-2 pr-1 py-1 gap-1 bg-primary/5 border-primary/20 text-primary rounded-lg text-xs font-medium">
                  {brand.name}
                  <button onClick={() => toggleFilter("brand", id)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {attributeValueIds.map(id => {
              const val = attributes.flatMap(a => a.values).find(v => v.id === id);
              if (!val) return null;
              return (
                <Badge key={`pill-skin-${id}`} variant="outline" className="pl-2 pr-1 py-1 gap-1 bg-green-500/5 border-green-500/20 text-green-600 rounded-lg text-xs font-medium">
                  {val.value}
                  <button onClick={() => toggleFilter("skinType", id)} className="hover:bg-green-500/20 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {(minPrice !== undefined || maxPrice !== undefined) && (
              <Badge variant="outline" className="pl-2 pr-1 py-1 gap-1 bg-orange-500/5 border-orange-500/20 text-orange-600 rounded-lg text-xs font-medium">
                {formatPrice(minPrice || 0)} - {formatPrice(maxPrice || 5000000)}
                <button onClick={() => updateFilters({ minPrice: undefined, maxPrice: undefined })} className="hover:bg-orange-500/20 rounded-full p-0.5 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <button 
              onClick={clearAllFilters}
              className="text-xs font-semibold text-muted-foreground hover:text-primary underline underline-offset-4 px-2 py-1 transition-colors"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {isLoading && products.length === 0 ? (
              <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-muted/40 rounded-2xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="relative group/grid">
                {/* Visual loading indicator for filtering */}
                {(isLoading || isPending) && (
                   <div className="absolute inset-0 z-10 bg-background/30 backdrop-blur-[1px] flex flex-col items-center justify-start pt-20 transition-all duration-300 rounded-3xl">
                      <div className="bg-white/80 p-4 rounded-full shadow-lg flex items-center gap-3 border border-border/50 animate-in fade-in zoom-in duration-300">
                         <Loader2 className="h-5 w-5 animate-spin text-primary" />
                         <span className="text-sm font-medium">Đang cập nhật...</span>
                      </div>
                   </div>
                )}
                <div
                  className={`grid grid-cols-2 gap-4 md:gap-6 transition-opacity duration-300 ${(isLoading || isPending) ? "opacity-60 grayscale-[20%]" : "opacity-100"} ${
                    gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                  <div className="mt-16 flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl bg-white/50 border-border/50 hover:bg-primary hover:text-white transition-all"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {/* Always show first page */}
                        <Button
                          variant={page === 0 ? "default" : "outline"}
                          size="icon"
                          className={`w-10 h-10 rounded-xl text-sm transition-all border-border/50 ${page === 0 ? "shadow-lg shadow-primary/25" : "bg-white/50"}`}
                          onClick={() => handlePageChange(0)}
                        >
                          1
                        </Button>

                        {page > 2 && <span className="text-muted-foreground px-1">...</span>}

                        {/* Pages around current */}
                        {[...Array(totalPages)].map((_, i) => {
                          if (i === 0 || i === totalPages - 1) return null;
                          if (i < page - 1 || i > page + 1) return null;
                          return (
                            <Button
                              key={i}
                              variant={page === i ? "default" : "outline"}
                              size="icon"
                              className={`w-10 h-10 rounded-xl text-sm transition-all border-border/50 ${page === i ? "shadow-lg shadow-primary/25" : "bg-white/50"}`}
                              onClick={() => handlePageChange(i)}
                            >
                              {i + 1}
                            </Button>
                          );
                        })}

                        {page < totalPages - 3 && <span className="text-muted-foreground px-1">...</span>}

                        {/* Always show last page */}
                        {totalPages > 1 && (
                          <Button
                            variant={page === totalPages - 1 ? "default" : "outline"}
                            size="icon"
                            className={`w-10 h-10 rounded-xl text-sm transition-all border-border/50 ${page === totalPages - 1 ? "shadow-lg shadow-primary/25" : "bg-white/50"}`}
                            onClick={() => handlePageChange(totalPages - 1)}
                          >
                            {totalPages}
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl bg-white/50 border-border/50 hover:bg-primary hover:text-white transition-all"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Trang {page + 1} trên {totalPages}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-border mt-8">
                <div className="bg-muted/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại của bạn.
                </p>
                <Button onClick={clearAllFilters} className="rounded-full px-8 h-12">
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
