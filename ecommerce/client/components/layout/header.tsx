"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, Menu, X, Heart, Zap, Minus, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { type Category, formatPrice } from "@/lib/data";
import { fetchCategories, fetchUserProfile, logoutUser, type UserProfileResponse, fetchProducts, fetchSettings } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buildCategoryTree, cn } from "@/lib/utils";

type HeaderNavItem = {
  name: string;
  href: string;
  highlight?: boolean;
};

export type HeaderConfig = {
  logoText?: string;
  topBarText?: string;
  showTopBar?: boolean;
  navigation?: HeaderNavItem[];
};

const defaultNavigation: HeaderNavItem[] = [
  { name: "Trang chủ", href: "/", highlight: false },
  { name: "Sản phẩm", href: "/products", highlight: false },
  { name: "Sale", href: "/sale", highlight: true },
  { name: "Voucher", href: "/vouchers", highlight: false },
  { name: "Về chúng tôi", href: "/about", highlight: false },
  { name: "Liên hệ", href: "/contact", highlight: false },
];

export function Header({ config }: { config?: HeaderConfig }) {
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const { cartItems, isLoading: isLoadingCart, loadCart, removeItem, updateQuantity } = useCart();
  const cartItemCount = cartItems.length;

  const parsedNavigation = useMemo(() => {
    if (!settings["header_navigation_json"]) return defaultNavigation;
    try {
      const navigation = JSON.parse(settings["header_navigation_json"]);
      return Array.isArray(navigation) && navigation.length ? navigation : defaultNavigation;
    } catch {
      return defaultNavigation;
    }
  }, [settings]);

  const logoText = config?.logoText || settings["header_logo_text"] || "GlowSkin";
  const topBarText = config?.topBarText || settings["header_top_bar_text"] || "Miễn phí vận chuyển cho đơn hàng từ 500.000đ | Đổi trả trong 30 ngày";
  const showTopBar = config?.showTopBar ?? settings["header_show_top_bar"] !== "false";
  const navigation = config?.navigation?.length ? config.navigation : parsedNavigation;
  const categoryTree = buildCategoryTree(categories);

  useEffect(() => {
    async function loadData() {
      try {
        const settingsData = await fetchSettings();
        const settingsMap = settingsData.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {} as Record<string, string>);
        setSettings(settingsMap);
      } catch (error) {
        console.error("Failed to fetch header settings:", error);
      }

      // Fetch categories independently as they should be public
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }

      // Fetch user profile only if possible (it will fail for guests)
      try {
        const profileData = await fetchUserProfile();
        setUser(profileData);
      } catch (error) {
        // Silent error for profile if not logged in
        setUser(null);
      }
    }
    loadData();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    setIsSearchOpen(false);
    setShowSuggestions(false);
  };

  // Debounced search suggestions
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await fetchProducts({ 
          keyword: searchTerm, 
          size: 6 
        });
        setSuggestions(results);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);


  const updateFilters = useCallback((newParams: Record<string, string | number | undefined>) => {
    // Actually using current URL params
    const searchParamsObj = new URLSearchParams(window.location.search);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        searchParamsObj.delete(key);
      } else {
        searchParamsObj.set(key, String(value));
      }
    });

    router.push(`/products?${searchParamsObj.toString()}`);
  }, [router]);

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (open) {
      loadCart();
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    await updateQuantity(itemId, newQuantity);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      toast.success("Đã đăng xuất thành công");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar - promotional message */}
      <div className={cn("bg-gradient-to-r from-primary via-rose-400/90 to-primary-hover text-primary-foreground text-center py-2 text-sm", !showTopBar && "hidden")}>
        <p>{topBarText}</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-primary">{logoText}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium px-3 py-2 rounded-lg transition-all hover:bg-primary/5",
                  item.highlight ? "text-primary font-bold relative flex items-center gap-1" : "text-foreground/80 hover:text-primary",
                  pathname === item.href && "text-primary bg-primary/5"
                )}
              >
                {item.highlight && <Zap className="h-3.5 w-3.5 fill-primary" />}
                {item.name}
                {item.highlight && (
                  <span className="absolute -top-1 -right-2 text-[8px] bg-primary text-white px-1 rounded-full leading-tight animate-bounce">
                    HOT
                  </span>
                )}
              </Link>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium text-foreground/80 hover:text-primary transition-all flex items-center gap-1 h-9 px-3 rounded-lg hover:bg-primary/5">
                  Danh mục
                  <ChevronDown className="h-3 w-3 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="p-0 border-none shadow-2xl rounded-2xl overflow-hidden mt-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 w-[500px] gap-2 p-3 bg-popover border border-border/50">
                  {categoryTree.length > 0 ? (
                    categoryTree.map((category) => (
                      <div key={category.id} className="space-y-2 p-3 rounded-xl hover:bg-accent/50 transition-colors group/item">
                        <Link 
                          href={`/category/${category.slug}`}
                          className="block text-sm font-bold text-popover-foreground hover:text-primary transition-colors flex items-center justify-between"
                        >
                          {category.name}
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </Link>
                        {category.children && category.children.length > 0 && (
                          <ul className="space-y-1.5 border-l border-primary/10 ml-1 pl-3">
                            {category.children.map((child) => (
                              <li key={child.id}>
                                <Link 
                                  href={`/category/${child.slug}`}
                                  className="text-[13px] text-muted-foreground hover:text-primary transition-colors block py-0.5"
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-8 text-center text-muted-foreground text-sm italic">
                      Đang tải danh mục...
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 bg-muted border-0 focus-visible:ring-primary rounded-full h-10 transition-all focus:bg-background focus:ring-1 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchTerm.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border shadow-xl rounded-2xl overflow-hidden z-[60] backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">
                    Đang tìm kiếm...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase px-3 py-2 tracking-wider">
                      Sản phẩm gợi ý
                    </p>
                    <div className="space-y-1">
                      {suggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 transition-colors group"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={product.images[0]?.url || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {product.name}
                            </p>
                            <p className="text-xs text-primary font-bold">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/products?q=${searchTerm}`}
                      className="block text-center py-3 mt-1 border-t border-border/50 text-xs font-semibold text-primary hover:underline"
                      onClick={() => setShowSuggestions(false)}
                    >
                      Xem tất cả kết quả cho "{searchTerm}"
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Không tìm thấy sản phẩm nào
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Tìm kiếm"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Yêu thích">
              <Heart className="h-5 w-5" />
            </Button>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Tài khoản">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="w-[150px] truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">Hồ sơ của tôi</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="cursor-pointer">Đơn hàng</Link>
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"} className="cursor-pointer font-bold text-primary">
                          Trang quản trị
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/account/login" className="cursor-pointer">Đăng nhập</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/register" className="cursor-pointer">Đăng ký</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Giỏ hàng">
                  <ShoppingBag className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-gradient-to-b from-background to-secondary/5">
                <SheetHeader className="border-b border-border/50">
                  <SheetTitle className="font-serif text-xl">Giỏ hàng ({cartItemCount})</SheetTitle>
                </SheetHeader>
                
                {isLoadingCart ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="animate-spin">
                      <ShoppingBag className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">Đang tải giỏ hàng...</p>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <ShoppingBag className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm mb-2">Giỏ hàng trống</h3>
                    <p className="text-xs text-muted-foreground mb-6">Hãy khám phá và thêm sản phẩm vào giỏ hàng</p>
                    <Button asChild size="sm" onClick={() => setSheetOpen(false)} className="w-full sm:w-auto">
                      <Link href="/products">Bắt đầu mua sắm</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-3 p-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="group relative rounded-lg border border-border/50 bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                            <div className="flex gap-3">
                              <Link
                                href={item.slug ? `/product/${item.slug}` : "/products"}
                                className="relative h-14 w-14 flex-shrink-0 rounded-md overflow-hidden bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </Link>
                              
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <Link
                                  href={item.slug ? `/product/${item.slug}` : "/products"}
                                  className="font-medium text-xs hover:text-primary transition-colors line-clamp-2"
                                >
                                  {item.name}
                                </Link>
                                <div className="flex items-center justify-between">
                                  <p className="text-primary font-semibold text-xs">
                                    {formatPrice(item.price)}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveItem(item.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                              <span className="text-xs text-muted-foreground flex-1">Số lượng:</span>
                              <div className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/30">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-2.5 w-2.5" />
                                </Button>
                                <span className="w-6 text-center text-xs font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border/50 bg-gradient-to-t from-background to-transparent p-4 space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Tạm tính</span>
                          <span>{formatPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
                        </div>
                        <div className="h-px bg-border/30" />
                        <div className="flex justify-between font-semibold">
                          <span>Tổng</span>
                          <span className="text-primary">{formatPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
                        </div>
                      </div>
                      <Button asChild className="w-full bg-primary hover:bg-primary-hover" onClick={() => setSheetOpen(false)}>
                        <Link href="/cart" className="text-sm font-medium">Xem giỏ hàng & thanh toán</Link>
                      </Button>
                      <Button variant="outline" className="w-full text-sm" onClick={() => setSheetOpen(false)}>
                        Tiếp tục mua sắm
                      </Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden pb-4 px-4 relative">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 bg-muted border-0 h-11 rounded-xl"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>

            {/* Mobile Suggestions Area */}
            {searchTerm.trim().length >= 2 && (
              <div className="mt-2 bg-background border border-border shadow-lg rounded-xl overflow-hidden z-[60]">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Đang tìm...</div>
                ) : suggestions.length > 0 ? (
                  <div className="p-2">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                        onClick={() => {
                          setShowSuggestions(false);
                          setIsSearchOpen(false);
                        }}
                      >
                        <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={product.images[0]?.url || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-primary font-bold">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/products?q=${searchTerm}`}
                      className="block text-center py-3 mt-1 border-t border-border/50 text-xs font-semibold text-primary"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      Tất cả kết quả cho "{searchTerm}"
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">Không tìm thấy</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="font-serif text-primary">{logoText}</SheetTitle>
          </SheetHeader>
          <nav className="mt-8 flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-lg font-medium transition-colors hover:text-primary ${
                  item.highlight
                    ? "text-destructive font-bold flex items-center gap-2"
                    : "text-foreground/80"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.highlight && (
                  <Zap className="h-4 w-4 fill-destructive" />
                )}
                {item.name}
                {item.highlight && (
                  <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-sm animate-pulse">
                    HOT
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-3">Tài khoản</p>
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-3 bg-muted/50 rounded-lg mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-bold relative shrink-0">
                      {user.imageUrl ? (
                        <Image 
                          src={user.imageUrl} 
                          alt={user.name} 
                          fill 
                          className="object-cover"
                        />
                      ) : user.gender ? (
                        <Image 
                          src={user.gender === "male" 
                            ? "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&h=200&fit=crop" 
                            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop"} 
                          alt={user.name} 
                          fill 
                          className="object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate w-40">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/account"
                    className="block py-2 text-foreground/80 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hồ sơ của tôi
                  </Link>
                  <Link
                    href="/account/orders"
                    className="block py-2 text-foreground/80 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đơn hàng
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"}
                      className="block py-2 text-primary font-bold hover:text-primary/80"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Trang quản trị (Admin)
                    </Link>
                  )}
                  <button
                    className="block w-full text-left py-2 text-destructive hover:text-destructive/80"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/account/login"
                    className="block py-2 text-foreground/80 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/account/register"
                    className="block py-2 text-foreground/80 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-3 px-2">Danh mục</p>
              <Accordion type="single" collapsible className="w-full">
                {categoryTree.map((category) => (
                  <AccordionItem key={category.id} value={category.id} className="border-none">
                    <div className="flex items-center gap-2 group">
                      <Link
                        href={`/category/${category.slug}`}
                        className="flex-1 py-3 px-3 text-sm font-bold text-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                      {category.children && category.children.length > 0 && (
                        <AccordionTrigger className="w-12 h-12 flex items-center justify-center p-0 hover:no-underline" />
                      )}
                    </div>
                    {category.children && category.children.length > 0 && (
                      <AccordionContent className="pb-2 pt-0">
                        <div className="pl-6 space-y-1 mb-2 border-l border-primary/10 ml-5">
                          {category.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/category/${child.slug}`}
                              className="block py-2.5 px-3 text-xs text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
