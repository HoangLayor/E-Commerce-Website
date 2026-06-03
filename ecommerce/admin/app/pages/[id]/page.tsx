"use client";

import React, { useEffect, useState } from "react";
import { 
  adminFetchPageSections, 
  adminCreatePageSection, 
  adminUpdatePageSection, 
  adminDeletePageSection,
  adminReorderPageSections,
  adminUploadSectionImage,
  fetchCategories,
  SectionResponseDTO,
  CreatePageSectionRequest
} from "@/lib/api";
import type { Category } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, GripVertical } from "lucide-react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface BannerItem {
  image: string;
  title: string;
  subtitle: string;
  href: string;
}

interface SlideItem {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  gradient: string;
  accent?: string;
  decorations?: string[];
}

interface SideBannerItem {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  gradient: string;
  accent?: string;
}

interface QuickLinkItem {
  iconName: string;
  label: string;
  href: string;
}

interface HeaderNavItem {
  name: string;
  href: string;
  highlight: boolean;
}

interface FooterLinkItem {
  name: string;
  href: string;
}

interface FooterColumnItem {
  title: string;
  links: FooterLinkItem[];
}

interface FooterFeatureItem {
  iconName: string;
  title: string;
  description: string;
}

interface TestimonialItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  content: string;
  product: string;
}

interface BrandCarouselItem {
  name: string;
  logo: string;
}

interface BlogPostItem {
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
}

const defaultHeaderNavItems: HeaderNavItem[] = [
  { name: "Trang chủ", href: "/", highlight: false },
  { name: "Sản phẩm", href: "/products", highlight: false },
  { name: "Sale", href: "/sale", highlight: true },
  { name: "Voucher", href: "/vouchers", highlight: false },
  { name: "Về chúng tôi", href: "/about", highlight: false },
  { name: "Liên hệ", href: "/contact", highlight: false },
];

const defaultFooterLinksData: Record<string, FooterColumnItem> = {
  shop: {
    title: "Mua sắm",
    links: [
      { name: "Tất cả sản phẩm", href: "/products" },
      { name: "Chăm sóc da", href: "/category/cham-soc-da" },
      { name: "Trang điểm", href: "/category/trang-diem" },
      { name: "Chống nắng", href: "/category/chong-nang" },
    ],
  },
  support: {
    title: "Hỗ trợ",
    links: [
      { name: "Hướng dẫn mua hàng", href: "/help/how-to-buy" },
      { name: "Vận chuyển", href: "/help/shipping" },
      { name: "Liên hệ", href: "/contact" },
    ],
  },
  company: {
    title: "Về chúng tôi",
    links: [
      { name: "Giới thiệu", href: "/about" },
      { name: "Chính sách bảo mật", href: "/privacy" },
    ],
  },
};

const defaultFooterFeaturesData: FooterFeatureItem[] = [
  { iconName: "Truck", title: "Miễn phí vận chuyển", description: "Đơn hàng từ 500.000đ" },
  { iconName: "RotateCcw", title: "Đổi trả 30 ngày", description: "Không cần lý do" },
  { iconName: "Shield", title: "Chính hãng 100%", description: "Cam kết chất lượng" },
  { iconName: "CreditCard", title: "Thanh toán an toàn", description: "Bảo mật tuyệt đối" },
];

const defaultCategoriesSectionTitle = "Danh mục sản phẩm";
const defaultCategoriesSectionDescription =
  "Khám phá các danh mục sản phẩm đang có trên website.";

const defaultTestimonialsTitle = "Khách hàng nói gì về chúng tôi";
const defaultTestimonialsDescription =
  "Những đánh giá thực tế từ khách hàng đã mua sắm tại cửa hàng.";
const defaultTestimonialItems: TestimonialItem[] = [
  {
    id: "test_001",
    name: "Nguyễn Thị Lan",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    content: "Sản phẩm rất tốt, giao hàng nhanh và đóng gói cẩn thận.",
    product: "Serum Vitamin C 20%",
  },
  {
    id: "test_002",
    name: "Trần Minh Hương",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    content: "Tư vấn rõ ràng, sản phẩm đúng mô tả và rất hợp với da của tôi.",
    product: "Kem dưỡng ẩm Hyaluronic Acid",
  },
  {
    id: "test_003",
    name: "Lê Phương Trang",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    rating: 4,
    content: "Trải nghiệm mua hàng tốt, sẽ tiếp tục ủng hộ cửa hàng.",
    product: "Son môi lì Velvet",
  },
];

const defaultNewsletterTitle = "Nhận ưu đãi độc quyền";
const defaultNewsletterDescription =
  "Đăng ký nhận bản tin để cập nhật ưu đãi và xu hướng làm đẹp mới nhất.";
const defaultNewsletterPlaceholder = "Nhập email của bạn";
const defaultNewsletterButton = "Đăng ký";
const defaultNewsletterPrivacyNote =
  "Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc nào.";
const defaultNewsletterSuccessTitle = "Đăng ký thành công!";
const defaultNewsletterSuccessDescription =
  "Cảm ơn bạn đã đăng ký nhận tin từ GlowSkin.";

const defaultBrandCarouselTitle = "Thương hiệu đối tác đồng hành";
const defaultBrandItems: BrandCarouselItem[] = [
  { name: "Lancome", logo: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=120&auto=format&fit=crop&q=60" },
  { name: "Estee Lauder", logo: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=120&auto=format&fit=crop&q=60" },
  { name: "Shiseido", logo: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=120&auto=format&fit=crop&q=60" },
  { name: "La Roche-Posay", logo: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=120&auto=format&fit=crop&q=60" },
  { name: "Kiehl's", logo: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=120&auto=format&fit=crop&q=60" },
  { name: "L'Oreal", logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&auto=format&fit=crop&q=60" },
];

const defaultBlogTitle = "Góc làm đẹp và chia sẻ";
const defaultBlogDescription =
  "Cập nhật xu hướng làm đẹp và bí quyết chăm sóc da mới nhất.";
const defaultBlogPosts: BlogPostItem[] = [
  {
    title: "Bí quyết sở hữu làn da căng bóng",
    excerpt: "Tìm hiểu quy trình dưỡng da đơn giản giúp cấp ẩm sâu và cải thiện vẻ ngoài rạng rỡ.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600",
    date: "18 Tháng 5, 2026",
    readTime: "5 phút đọc",
  },
  {
    title: "Top kem chống nắng phù hợp mùa hè",
    excerpt: "Đánh giá các dòng kem chống nắng nhẹ mặt, dễ dùng và phù hợp với thời tiết nóng ẩm.",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600",
    date: "15 Tháng 5, 2026",
    readTime: "4 phút đọc",
  },
  {
    title: "Niacinamide trong chăm sóc da",
    excerpt: "Hoạt chất phổ biến giúp hỗ trợ làm đều màu da và cải thiện bề mặt da khi dùng đúng cách.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600",
    date: "10 Tháng 5, 2026",
    readTime: "6 phút đọc",
  },
];

function normalizeCategoryIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function normalizeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Component con để render TableRow kéo thả được
function SortableTableRow({ 
  section, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: { 
  section: SectionResponseDTO, 
  onEdit: (s: SectionResponseDTO) => void, 
  onDelete: (id: number) => void,
  onToggleActive: (id: number, active: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  // Hàm render giao diện ConfigJson thông minh
  const renderConfigJson = (json: any) => {
    if (!json || Object.keys(json).length === 0) {
      return <span className="text-muted-foreground italic">Mặc định</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {json.filter && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Lọc: {json.filter}
          </Badge>
        )}
        {json.backgroundColor && (
          <div className="flex items-center gap-1 border rounded px-2 py-0.5 text-xs bg-white">
            Nền: <div className="w-3 h-3 rounded-full border shadow-sm" style={{ backgroundColor: json.backgroundColor }} />
          </div>
        )}
        {json.html && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Có chứa HTML
          </Badge>
        )}
        {json.banners && Array.isArray(json.banners) && (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Banner: {json.banners.length} mục
          </Badge>
        )}
        {json.slides && Array.isArray(json.slides) && (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            Slides: {json.slides.length} mục
          </Badge>
        )}
        {json.sideBanners && Array.isArray(json.sideBanners) && (
          <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
            Banner phụ: {json.sideBanners.length} mục
          </Badge>
        )}
        {json.quickLinks && Array.isArray(json.quickLinks) && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Quick Links: {json.quickLinks.length} mục
          </Badge>
        )}
        {json.testimonials && Array.isArray(json.testimonials) && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Testimonials: {json.testimonials.length} mục
          </Badge>
        )}
        {json.brands && Array.isArray(json.brands) && (
          <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
            Brands: {json.brands.length} mục
          </Badge>
        )}
        {json.posts && Array.isArray(json.posts) && (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Posts: {json.posts.length} mục
          </Badge>
        )}
        {json.placeholder && (
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
            Newsletter
          </Badge>
        )}
        {(!json.filter && !json.backgroundColor && !json.html && !json.banners && !json.slides && !json.sideBanners && !json.quickLinks && !json.testimonials && !json.brands && !json.posts && !json.placeholder) && (
          <span className="max-w-[200px] truncate font-mono text-xs text-muted-foreground">
            {JSON.stringify(json)}
          </span>
        )}
      </div>
    );
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className={`group ${isDragging ? 'bg-muted/50 shadow-md relative' : ''} ${!section.active ? 'opacity-50 grayscale' : ''}`}
    >
      <TableCell className="w-[50px] p-0 text-center">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-primary flex justify-center py-4 text-muted-foreground">
          <GripVertical className="h-5 w-5" />
        </div>
      </TableCell>
      <TableCell className="font-bold text-center bg-muted/20 w-[60px]">{section.position}</TableCell>
      <TableCell className="font-medium">
        <Badge variant="secondary" className="font-mono text-[11px]">{section.type}</Badge>
      </TableCell>
      <TableCell>{section.title || <span className="text-muted-foreground italic">Không có</span>}</TableCell>
      <TableCell>{renderConfigJson(section.configJson)}</TableCell>
      <TableCell className="text-center w-[100px]">
        <Switch 
          checked={section.active} 
          onCheckedChange={(checked) => onToggleActive(section.id, checked)}
        />
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(section)}>
          <Edit className="h-4 w-4 mr-1" /> Sửa
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(section.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}


export default function PageSectionManager() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const idStr = typeof params?.id === "string" ? params.id : "";
  const pageId = idStr ? parseInt(idStr) : NaN;
  const pageName = searchParams.get("name") || `Page #${idStr}`;
  
  const [sections, setSections] = useState<SectionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionResponseDTO | null>(null);
  
  const [formData, setFormData] = useState({
    type: "HERO_SECTION",
    title: "",
    position: "1",
    configJsonStr: "{}",
    active: true,
    bannerItems: [{ image: "", title: "", subtitle: "", href: "" }] as BannerItem[],
    heroBadgeText: "",
    heroTitle: "",
    heroSubtitle: "",
    heroDescription: "",
    heroPrimaryCtaLabel: "",
    heroPrimaryCtaLink: "",
    heroSecondaryCtaLabel: "",
    heroSecondaryCtaLink: "",
    heroImage: "",
    headerLogoText: "GlowSkin",
    headerTopBarText: "Miễn phí vận chuyển cho đơn hàng từ 500.000đ | Đổi trả trong 30 ngày",
    headerShowTopBar: true,
    headerNavItems: defaultHeaderNavItems as HeaderNavItem[],
    footerStoreName: "GlowSkin",
    footerStoreDescription: "Khám phá vẻ đẹp toàn diện với các sản phẩm mỹ phẩm cao cấp, chính hãng.",
    footerStoreAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    footerContactPhone: "1900 1234 56",
    footerContactEmail: "support@glowskin.vn",
    footerShowNewsletter: true,
    footerNewsletterTitle: "Đăng ký nhận tin",
    footerNewsletterDescription: "Nhận ưu đãi độc quyền và cập nhật xu hướng làm đẹp mới nhất.",
    footerNewsletterPlaceholder: "Email của bạn",
    footerNewsletterButton: "Đăng ký",
    footerSocialFacebookUrl: "https://facebook.com",
    footerSocialInstagramUrl: "https://instagram.com",
    footerSocialYoutubeUrl: "https://youtube.com",
    footerPaymentMethods: "VISA,MC,MoMo,VNP",
    footerLinksJsonStr: JSON.stringify(defaultFooterLinksData, null, 2),
    footerFeaturesJsonStr: JSON.stringify(defaultFooterFeaturesData, null, 2),
    categoryDescription: defaultCategoriesSectionDescription,
    categoryIds: [] as string[],
    categoryLimit: "",
    categoryShowProductCount: true,
    categoryShowNavigation: true,
    categoryShowDots: true,
    categoryAutoplay: true,
    categoryAutoplayDelay: "3000",
    categoryOnlyRoot: false,
    testimonialsDescription: defaultTestimonialsDescription,
    testimonialItems: defaultTestimonialItems as TestimonialItem[],
    newsletterDescription: defaultNewsletterDescription,
    newsletterPlaceholder: defaultNewsletterPlaceholder,
    newsletterButton: defaultNewsletterButton,
    newsletterPrivacyNote: defaultNewsletterPrivacyNote,
    newsletterSuccessTitle: defaultNewsletterSuccessTitle,
    newsletterSuccessDescription: defaultNewsletterSuccessDescription,
    brandItems: defaultBrandItems as BrandCarouselItem[],
    blogDescription: defaultBlogDescription,
    blogPosts: defaultBlogPosts as BlogPostItem[],
    promoSlides: [] as SlideItem[],
    promoSideBanners: [] as SideBannerItem[],
    promoQuickLinks: [] as QuickLinkItem[]
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const [sectionImageUploading, setSectionImageUploading] = useState(false);
  const [sectionImagePreview, setSectionImagePreview] = useState<string | null>(null);
  const [promoTab, setPromoTab] = useState<"slides" | "sideBanners" | "quickLinks">("slides");
  const [uploadingPromoSlideIndex, setUploadingPromoSlideIndex] = useState<number | null>(null);
  const [uploadingPromoSideBannerIndex, setUploadingPromoSideBannerIndex] = useState<number | null>(null);
  const [uploadingTestimonialIndex, setUploadingTestimonialIndex] = useState<number | null>(null);
  const [uploadingBrandIndex, setUploadingBrandIndex] = useState<number | null>(null);
  const [uploadingBlogPostIndex, setUploadingBlogPostIndex] = useState<number | null>(null);

  // Setup cho DndKit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isNaN(pageId)) {
      loadSections();
    } else {
      setLoading(false);
    }
  }, [pageId]);

  async function loadSections() {
    if (isNaN(pageId)) return;
    try {
      setLoading(true);
      const data = await adminFetchPageSections(pageId);
      // Sắp xếp theo vị trí
      data.sort((a, b) => a.position - b.position);
      setSections(data);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  // Xử lý sự kiện sau khi thả kéo
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Cập nhật lại trường position của từng phần tử theo Index
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          position: index + 1
        }));

        // Gửi API lưu thứ tự mới (Chạy ngầm không block UI)
        const reorderPayload = updatedItems.map(item => ({ id: item.id, position: item.position }));
        adminReorderPageSections(pageId, reorderPayload).then(() => {
          toast.success("Đã cập nhật thứ tự thành công!");
        }).catch(() => {
          toast.error("Lỗi khi cập nhật thứ tự, vui lòng tải lại trang.");
        });

        return updatedItems;
      });
    }
  };

  async function handleToggleActive(id: number, active: boolean) {
    // Cập nhật UI ngay lập tức
    setSections(items => items.map(item => item.id === id ? { ...item, active } : item));
    
    // Gửi yêu cầu API
    try {
      const section = sections.find(s => s.id === id);
      if (!section) return;
      
      const payload: CreatePageSectionRequest = {
        pageId: pageId,
        type: section.type,
        title: section.title || "",
        position: section.position,
        configJson: section.configJson,
        active: active
      };
      
      await adminUpdatePageSection(id, payload);
      toast.success(`Đã ${active ? "hiện" : "ẩn"} section thành công.`);
    } catch (err: any) {
      toast.error("Không thể thay đổi trạng thái!");
      // Revert lại nếu lỗi
      setSections(items => items.map(item => item.id === id ? { ...item, active: !active } : item));
    }
  }

  function isBannerType(type: string) {
    return type === "AD_BANNER_INLINE" || type === "IMAGE_BANNER";
  }

  // Check if type is HERO_SECTION
  function isHeroType(type: string) {
    return type === "HERO_SECTION";
  }

  // Check if type is PROMOTIONAL_SLIDE
  function isPromoSlideType(type: string) {
    return type === "PROMOTIONAL_SLIDE";
  }

  function isCategoriesType(type: string) {
    return type === "CATEGORIES_SECTION";
  }

  function isTestimonialsType(type: string) {
    return type === "TESTIMONIALS";
  }

  function isNewsletterType(type: string) {
    return type === "NEWSLETTER";
  }

  function isBrandCarouselType(type: string) {
    return type === "BRAND_CAROUSEL";
  }

  function isRecentBlogPostsType(type: string) {
    return type === "RECENT_BLOG_POSTS";
  }

  function isHeaderType(type: string) {
    return type === "HEADER_SECTION";
  }

  function isFooterType(type: string) {
    return type === "FOOTER_SECTION";
  }

  async function loadAvailableCategories() {
    if (availableCategories.length > 0 || categoriesLoading) return;

    try {
      setCategoriesLoading(true);
      const data = await fetchCategories();
      setAvailableCategories(data);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh mục sản phẩm.");
    } finally {
      setCategoriesLoading(false);
    }
  }

  function handleTypeChange(type: string) {
    if (isCategoriesType(type)) {
      loadAvailableCategories();
    }

    setFormData(prev => ({
      ...prev,
      type,
      title: !prev.title.trim()
        ? isCategoriesType(type)
          ? defaultCategoriesSectionTitle
          : isTestimonialsType(type)
            ? defaultTestimonialsTitle
            : isNewsletterType(type)
              ? defaultNewsletterTitle
              : isBrandCarouselType(type)
                ? defaultBrandCarouselTitle
                : isRecentBlogPostsType(type)
                  ? defaultBlogTitle
                  : prev.title
        : prev.title,
    }));
  }

  function handleOpenDialog(section?: SectionResponseDTO) {
    if (section) {
      const sectionBanners = section.configJson?.banners;
      const sectionImage = section.configJson?.image || null;
      const slides = section.configJson?.slides || [];
      const sideBanners = section.configJson?.sideBanners || [];
      const quickLinks = section.configJson?.quickLinks || [];
      const categoryIds = normalizeCategoryIds(section.configJson?.categoryIds);
      const testimonialItems = Array.isArray(section.configJson?.testimonials)
        ? section.configJson.testimonials.map((item: any, index: number) => ({
            id: item.id || `test_${index + 1}`,
            name: item.name || "",
            avatar: item.avatar || "",
            rating: normalizeNumber(item.rating, 5),
            content: item.content || "",
            product: item.product || "",
          }))
        : defaultTestimonialItems;
      const brandItems = Array.isArray(section.configJson?.brands)
        ? section.configJson.brands.map((item: any) => ({
            name: item.name || "",
            logo: item.logo || "",
          }))
        : defaultBrandItems;
      const blogPosts = Array.isArray(section.configJson?.posts)
        ? section.configJson.posts.map((item: any) => ({
            title: item.title || "",
            excerpt: item.excerpt || "",
            image: item.image || "",
            date: item.date || "",
            readTime: item.readTime || "",
          }))
        : defaultBlogPosts;
      if (isCategoriesType(section.type)) {
        loadAvailableCategories();
      }
      setEditingSection(section);
      setFormData({
        type: section.type,
        title: section.title || section.configJson?.title || "",
        position: section.position.toString(),
        configJsonStr: JSON.stringify(section.configJson, null, 2),
        active: section.active ?? true,
        bannerItems: isBannerType(section.type) && Array.isArray(sectionBanners) && sectionBanners.length > 0
          ? sectionBanners.map((banner: any) => ({
              image: banner.image || "",
              title: banner.title || "",
              subtitle: banner.subtitle || "",
              href: banner.href || ""
            }))
          : [{ image: "", title: "", subtitle: "", href: "" }],
        heroBadgeText: section.configJson?.badgeText || "",
        heroTitle: section.configJson?.title || "",
        heroSubtitle: section.configJson?.subtitle || "",
        heroDescription: section.configJson?.description || "",
        heroPrimaryCtaLabel: section.configJson?.primaryCtaLabel || "",
        heroPrimaryCtaLink: section.configJson?.primaryCtaLink || "",
        heroSecondaryCtaLabel: section.configJson?.secondaryCtaLabel || "",
        heroSecondaryCtaLink: section.configJson?.secondaryCtaLink || "",
        heroImage: section.configJson?.image || "",
        headerLogoText: section.configJson?.logoText || "GlowSkin",
        headerTopBarText: section.configJson?.topBarText || "Miễn phí vận chuyển cho đơn hàng từ 500.000đ | Đổi trả trong 30 ngày",
        headerShowTopBar: section.configJson?.showTopBar !== false,
        headerNavItems: Array.isArray(section.configJson?.navigation) ? section.configJson.navigation : defaultHeaderNavItems,
        footerStoreName: section.configJson?.storeName || "GlowSkin",
        footerStoreDescription: section.configJson?.storeDescription || "Khám phá vẻ đẹp toàn diện với các sản phẩm mỹ phẩm cao cấp, chính hãng.",
        footerStoreAddress: section.configJson?.storeAddress || "123 Nguyễn Huệ, Quận 1, TP.HCM",
        footerContactPhone: section.configJson?.contactPhone || "1900 1234 56",
        footerContactEmail: section.configJson?.contactEmail || "support@glowskin.vn",
        footerShowNewsletter: section.configJson?.showNewsletter !== false,
        footerNewsletterTitle: section.configJson?.newsletterTitle || "Đăng ký nhận tin",
        footerNewsletterDescription: section.configJson?.newsletterDescription || "Nhận ưu đãi độc quyền và cập nhật xu hướng làm đẹp mới nhất.",
        footerNewsletterPlaceholder: section.configJson?.newsletterPlaceholder || "Email của bạn",
        footerNewsletterButton: section.configJson?.newsletterButton || "Đăng ký",
        footerSocialFacebookUrl: section.configJson?.socialFacebookUrl || "https://facebook.com",
        footerSocialInstagramUrl: section.configJson?.socialInstagramUrl || "https://instagram.com",
        footerSocialYoutubeUrl: section.configJson?.socialYoutubeUrl || "https://youtube.com",
        footerPaymentMethods: Array.isArray(section.configJson?.paymentMethods) ? section.configJson.paymentMethods.join(",") : "VISA,MC,MoMo,VNP",
        footerLinksJsonStr: JSON.stringify(section.configJson?.links || defaultFooterLinksData, null, 2),
        footerFeaturesJsonStr: JSON.stringify(section.configJson?.features || defaultFooterFeaturesData, null, 2),
        categoryDescription: section.configJson?.description || defaultCategoriesSectionDescription,
        categoryIds,
        categoryLimit: section.configJson?.limit ? String(section.configJson.limit) : "",
        categoryShowProductCount: section.configJson?.showProductCount !== false,
        categoryShowNavigation: section.configJson?.showNavigation !== false,
        categoryShowDots: section.configJson?.showDots !== false,
        categoryAutoplay: section.configJson?.autoplay !== false,
        categoryAutoplayDelay: section.configJson?.autoplayDelay ? String(section.configJson.autoplayDelay) : "3000",
        categoryOnlyRoot: section.configJson?.onlyRootCategories === true,
        testimonialsDescription: section.configJson?.description || defaultTestimonialsDescription,
        testimonialItems,
        newsletterDescription: section.configJson?.description || defaultNewsletterDescription,
        newsletterPlaceholder: section.configJson?.placeholder || defaultNewsletterPlaceholder,
        newsletterButton: section.configJson?.buttonLabel || defaultNewsletterButton,
        newsletterPrivacyNote: section.configJson?.privacyNote || defaultNewsletterPrivacyNote,
        newsletterSuccessTitle: section.configJson?.successTitle || defaultNewsletterSuccessTitle,
        newsletterSuccessDescription: section.configJson?.successDescription || defaultNewsletterSuccessDescription,
        brandItems,
        blogDescription: section.configJson?.description || defaultBlogDescription,
        blogPosts,
        promoSlides: Array.isArray(slides) ? slides : [],
        promoSideBanners: Array.isArray(sideBanners) ? sideBanners : [],
        promoQuickLinks: Array.isArray(quickLinks) ? quickLinks : []
      });
      setSectionImagePreview(sectionImage);
      setPromoTab("slides");
    } else {
      setEditingSection(null);
      setFormData({
        type: "HERO_SECTION",
        title: "",
        position: (sections.length + 1).toString(),
        configJsonStr: "{\n  \n}",
        active: true,
        bannerItems: [{ image: "", title: "", subtitle: "", href: "" }],
        heroBadgeText: "",
        heroTitle: "",
        heroSubtitle: "",
        heroDescription: "",
        heroPrimaryCtaLabel: "",
        heroPrimaryCtaLink: "",
        heroSecondaryCtaLabel: "",
        heroSecondaryCtaLink: "",
        heroImage: "",
        headerLogoText: "GlowSkin",
        headerTopBarText: "Miễn phí vận chuyển cho đơn hàng từ 500.000đ | Đổi trả trong 30 ngày",
        headerShowTopBar: true,
        headerNavItems: defaultHeaderNavItems,
        footerStoreName: "GlowSkin",
        footerStoreDescription: "Khám phá vẻ đẹp toàn diện với các sản phẩm mỹ phẩm cao cấp, chính hãng.",
        footerStoreAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
        footerContactPhone: "1900 1234 56",
        footerContactEmail: "support@glowskin.vn",
        footerShowNewsletter: true,
        footerNewsletterTitle: "Đăng ký nhận tin",
        footerNewsletterDescription: "Nhận ưu đãi độc quyền và cập nhật xu hướng làm đẹp mới nhất.",
        footerNewsletterPlaceholder: "Email của bạn",
        footerNewsletterButton: "Đăng ký",
        footerSocialFacebookUrl: "https://facebook.com",
        footerSocialInstagramUrl: "https://instagram.com",
        footerSocialYoutubeUrl: "https://youtube.com",
        footerPaymentMethods: "VISA,MC,MoMo,VNP",
        footerLinksJsonStr: JSON.stringify(defaultFooterLinksData, null, 2),
        footerFeaturesJsonStr: JSON.stringify(defaultFooterFeaturesData, null, 2),
        categoryDescription: defaultCategoriesSectionDescription,
        categoryIds: [],
        categoryLimit: "",
        categoryShowProductCount: true,
        categoryShowNavigation: true,
        categoryShowDots: true,
        categoryAutoplay: true,
        categoryAutoplayDelay: "3000",
        categoryOnlyRoot: false,
        testimonialsDescription: defaultTestimonialsDescription,
        testimonialItems: defaultTestimonialItems,
        newsletterDescription: defaultNewsletterDescription,
        newsletterPlaceholder: defaultNewsletterPlaceholder,
        newsletterButton: defaultNewsletterButton,
        newsletterPrivacyNote: defaultNewsletterPrivacyNote,
        newsletterSuccessTitle: defaultNewsletterSuccessTitle,
        newsletterSuccessDescription: defaultNewsletterSuccessDescription,
        brandItems: defaultBrandItems,
        blogDescription: defaultBlogDescription,
        blogPosts: defaultBlogPosts,
        promoSlides: [],
        promoSideBanners: [],
        promoQuickLinks: []
      });
      setSectionImagePreview(null);
      setPromoTab("slides");
    }
    setJsonError(null);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJsonError(null);

    let parsedConfig: any = {};
    if (isBannerType(formData.type)) {
      const validBanners = formData.bannerItems.filter(item => item.image.trim());
      if (validBanners.length === 0) {
        setJsonError("Vui lòng nhập ít nhất 1 banner có đường dẫn ảnh.");
        return;
      }
      parsedConfig = { banners: validBanners };
    } else if (isHeroType(formData.type)) {
      parsedConfig = {
        badgeText: formData.heroBadgeText,
        title: formData.heroTitle,
        subtitle: formData.heroSubtitle,
        description: formData.heroDescription,
        primaryCtaLabel: formData.heroPrimaryCtaLabel,
        primaryCtaLink: formData.heroPrimaryCtaLink,
        secondaryCtaLabel: formData.heroSecondaryCtaLabel,
        secondaryCtaLink: formData.heroSecondaryCtaLink,
        image: formData.heroImage
      };
    } else if (isPromoSlideType(formData.type)) {
      parsedConfig = {
        slides: formData.promoSlides,
        sideBanners: formData.promoSideBanners,
        quickLinks: formData.promoQuickLinks
      };
    } else if (isCategoriesType(formData.type)) {
      const limitText = formData.categoryLimit.trim();
      const delayText = formData.categoryAutoplayDelay.trim();
      const limit = limitText ? Number.parseInt(limitText, 10) : null;
      const autoplayDelay = delayText ? Number.parseInt(delayText, 10) : 3000;

      if (limitText && (!Number.isFinite(limit) || Number(limit) < 1)) {
        setJsonError("Giới hạn danh mục phải là số lớn hơn 0.");
        return;
      }

      if (!Number.isFinite(autoplayDelay) || autoplayDelay < 500) {
        setJsonError("Thời gian autoplay phải lớn hơn hoặc bằng 500ms.");
        return;
      }

      parsedConfig = {
        title: formData.title.trim(),
        description: formData.categoryDescription.trim(),
        categoryIds: formData.categoryIds,
        limit,
        showProductCount: formData.categoryShowProductCount,
        showNavigation: formData.categoryShowNavigation,
        showDots: formData.categoryShowDots,
        autoplay: formData.categoryAutoplay,
        autoplayDelay,
        onlyRootCategories: formData.categoryOnlyRoot,
      };
    } else if (isTestimonialsType(formData.type)) {
      const validTestimonials = formData.testimonialItems
        .map((item, index) => ({
          id: item.id || `test_${index + 1}`,
          name: item.name.trim(),
          avatar: item.avatar.trim(),
          rating: Math.min(5, Math.max(1, normalizeNumber(item.rating, 5))),
          content: item.content.trim(),
          product: item.product.trim(),
        }))
        .filter(item => item.name && item.content);

      if (validTestimonials.length === 0) {
        setJsonError("Vui lòng nhập ít nhất 1 đánh giá có tên và nội dung.");
        return;
      }

      parsedConfig = {
        title: formData.title.trim(),
        description: formData.testimonialsDescription.trim(),
        testimonials: validTestimonials,
      };
    } else if (isNewsletterType(formData.type)) {
      parsedConfig = {
        title: formData.title.trim(),
        description: formData.newsletterDescription.trim(),
        placeholder: formData.newsletterPlaceholder.trim(),
        buttonLabel: formData.newsletterButton.trim(),
        privacyNote: formData.newsletterPrivacyNote.trim(),
        successTitle: formData.newsletterSuccessTitle.trim(),
        successDescription: formData.newsletterSuccessDescription.trim(),
      };
    } else if (isBrandCarouselType(formData.type)) {
      const validBrands = formData.brandItems
        .map(item => ({
          name: item.name.trim(),
          logo: item.logo.trim(),
        }))
        .filter(item => item.name && item.logo);

      if (validBrands.length === 0) {
        setJsonError("Vui lòng nhập ít nhất 1 thương hiệu có tên và logo.");
        return;
      }

      parsedConfig = {
        title: formData.title.trim(),
        brands: validBrands,
      };
    } else if (isRecentBlogPostsType(formData.type)) {
      const validPosts = formData.blogPosts
        .map(item => ({
          title: item.title.trim(),
          excerpt: item.excerpt.trim(),
          image: item.image.trim(),
          date: item.date.trim(),
          readTime: item.readTime.trim(),
        }))
        .filter(item => item.title && item.excerpt);

      if (validPosts.length === 0) {
        setJsonError("Vui lòng nhập ít nhất 1 bài viết có tiêu đề và mô tả.");
        return;
      }

      parsedConfig = {
        title: formData.title.trim(),
        description: formData.blogDescription.trim(),
        posts: validPosts,
      };
    } else if (isHeaderType(formData.type)) {
      parsedConfig = {
        logoText: formData.headerLogoText,
        topBarText: formData.headerTopBarText,
        showTopBar: formData.headerShowTopBar,
        navigation: formData.headerNavItems
          .map(item => ({
            name: item.name.trim(),
            href: item.href.trim(),
            highlight: item.highlight,
          }))
          .filter(item => item.name && item.href),
      };
    } else if (isFooterType(formData.type)) {
      let links = defaultFooterLinksData;
      let features = defaultFooterFeaturesData;
      try {
        links = JSON.parse(formData.footerLinksJsonStr);
        features = JSON.parse(formData.footerFeaturesJsonStr);
      } catch (err: any) {
        setJsonError("Lỗi cú pháp JSON footer: " + err.message);
        return;
      }
      parsedConfig = {
        storeName: formData.footerStoreName,
        storeDescription: formData.footerStoreDescription,
        storeAddress: formData.footerStoreAddress,
        contactPhone: formData.footerContactPhone,
        contactEmail: formData.footerContactEmail,
        showNewsletter: formData.footerShowNewsletter,
        newsletterTitle: formData.footerNewsletterTitle,
        newsletterDescription: formData.footerNewsletterDescription,
        newsletterPlaceholder: formData.footerNewsletterPlaceholder,
        newsletterButton: formData.footerNewsletterButton,
        socialFacebookUrl: formData.footerSocialFacebookUrl,
        socialInstagramUrl: formData.footerSocialInstagramUrl,
        socialYoutubeUrl: formData.footerSocialYoutubeUrl,
        paymentMethods: formData.footerPaymentMethods.split(",").map(item => item.trim()).filter(Boolean),
        links,
        features,
      };
    } else {
      try {
        parsedConfig = JSON.parse(formData.configJsonStr);
      } catch (err: any) {
        setJsonError("Lỗi cú pháp JSON: " + err.message);
        return;
      }
    }

    const payload: CreatePageSectionRequest = {
      pageId: pageId,
      type: formData.type,
      title: formData.title,
      position: parseInt(formData.position) || 1,
      configJson: parsedConfig,
      active: formData.active
    };

    try {
      setSaving(true);
      if (editingSection) {
        await adminUpdatePageSection(editingSection.id, payload);
        toast.success("Cập nhật section thành công.");
      } else {
        await adminCreatePageSection(payload);
        toast.success("Thêm section thành công.");
      }
      setDialogOpen(false);
      loadSections();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi lưu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadBannerImage(index: number, file: File) {
    if (!file) return;

    try {
      setUploadingImageIndex(index);
      const result = await adminUploadSectionImage(file);
      setFormData(prev => ({
        ...prev,
        bannerItems: prev.bannerItems.map((item, idx) => idx === index ? { ...item, image: result.url } : item)
      }));
      toast.success("Ảnh banner đã được tải lên thành công.");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải ảnh lên.");
    } finally {
      setUploadingImageIndex(null);
    }
  }

  async function handleUploadPromoSlideImage(index: number, file: File) {
    if (!file) return;
    try {
      setUploadingPromoSlideIndex(index);
      const result = await adminUploadSectionImage(file);
      setFormData(prev => ({
        ...prev,
        promoSlides: prev.promoSlides.map((item, idx) => idx === index ? { ...item, image: result.url } : item)
      }));
      toast.success("Ảnh slide đã được tải lên thành công.");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải ảnh lên.");
    } finally {
      setUploadingPromoSlideIndex(null);
    }
  }

  async function handleUploadPromoSideBannerImage(index: number, file: File) {
    if (!file) return;
    try {
      setUploadingPromoSideBannerIndex(index);
      const result = await adminUploadSectionImage(file);
      setFormData(prev => ({
        ...prev,
        promoSideBanners: prev.promoSideBanners.map((item, idx) => idx === index ? { ...item, image: result.url } : item)
      }));
      toast.success("Ảnh banner phụ đã được tải lên thành công.");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải ảnh lên.");
    } finally {
      setUploadingPromoSideBannerIndex(null);
    }
  }

  async function handleUploadTestimonialAvatar(index: number, file: File) {
    if (!file) return;
    try {
      setUploadingTestimonialIndex(index);
      const result = await adminUploadSectionImage(file);
      setFormData(prev => ({
        ...prev,
        testimonialItems: prev.testimonialItems.map((item, idx) => idx === index ? { ...item, avatar: result.url } : item)
      }));
      toast.success("Avatar đánh giá đã được tải lên.");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải avatar lên.");
    } finally {
      setUploadingTestimonialIndex(null);
    }
  }

  async function handleUploadBrandLogo(index: number, file: File) {
    if (!file) return;
    try {
      setUploadingBrandIndex(index);
      const result = await adminUploadSectionImage(file);
      setFormData(prev => ({
        ...prev,
        brandItems: prev.brandItems.map((item, idx) => idx === index ? { ...item, logo: result.url } : item)
      }));
      toast.success("Logo thương hiệu đã được tải lên.");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải logo lên.");
    } finally {
      setUploadingBrandIndex(null);
    }
  }

  async function handleUploadBlogPostImage(index: number, file: File) {
    if (!file) return;
    try {
      setUploadingBlogPostIndex(index);
      const result = await adminUploadSectionImage(file);
      setFormData(prev => ({
        ...prev,
        blogPosts: prev.blogPosts.map((item, idx) => idx === index ? { ...item, image: result.url } : item)
      }));
      toast.success("Ảnh bài viết đã được tải lên.");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải ảnh bài viết lên.");
    } finally {
      setUploadingBlogPostIndex(null);
    }
  }

  async function handleUploadSectionImage(file: File) {
    if (!file) return;

    try {
      setSectionImageUploading(true);
      const result = await adminUploadSectionImage(file);

      // Merge into existing JSON config (preserve other fields)
      let current = {} as any;
      try {
        current = JSON.parse(formData.configJsonStr || "{}");
      } catch (e) {
        current = {};
      }
      current.image = result.url;
      const updated = JSON.stringify(current, null, 2);
      setFormData(prev => ({ ...prev, configJsonStr: updated, heroImage: result.url }));
      setSectionImagePreview(result.url);
      toast.success("Ảnh section đã được tải lên và lưu vào cấu hình.");
    } catch (err: any) {
      toast.error(err.message || "Không thể tải ảnh lên.");
    } finally {
      setSectionImageUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc muốn xóa section này? Hành động này không thể hoàn tác.")) return;
    try {
      await adminDeletePageSection(id);
      toast.success("Xóa thành công.");
      loadSections();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi xóa.");
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
      <div className="flex items-center gap-4">
        <Link href="/pages">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cấu trúc: {pageName}</h1>
          <p className="text-muted-foreground mt-1">
            Kéo thả biểu tượng 6 chấm (Grip) để sắp xếp vị trí các khối nội dung.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()} className="shadow-md">
          <Plus className="h-4 w-4 mr-2" /> Thêm Section
        </Button>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-md border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[60px] text-center">Vị trí</TableHead>
                <TableHead>Loại (Type)</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Đặc trưng / JSON</TableHead>
                <TableHead className="text-center">Hiển thị</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Trang này chưa có section nào.
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext 
                  items={sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section) => (
                    <SortableTableRow 
                      key={section.id} 
                      section={section} 
                      onEdit={handleOpenDialog} 
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Chỉnh sửa Section" : "Thêm Section mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại Component (Type)</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HEADER_SECTION">Header Section</SelectItem>
                    <SelectItem value="HERO_SECTION">Hero Section</SelectItem>
                    <SelectItem value="PROMOTIONAL_SLIDE">Promotional Slide</SelectItem>
                    <SelectItem value="CATEGORIES_SECTION">Categories Section</SelectItem>
                    <SelectItem value="FLASH_SALE">Flash Sale Section</SelectItem>
                    <SelectItem value="AD_BANNER_INLINE">Ad Banner Inline</SelectItem>
                    <SelectItem value="FEATURED_PRODUCTS">Featured Products (Product Grid)</SelectItem>
                    <SelectItem value="AD_BANNER_INLINE">Ad Banner Inline</SelectItem>
                    <SelectItem value="IMAGE_BANNER">Image Banner Section</SelectItem>
                    <SelectItem value="BENEFITS">Benefits Section</SelectItem>
                    <SelectItem value="TESTIMONIALS">Testimonials Section</SelectItem>
                    <SelectItem value="NEWSLETTER">Newsletter Section</SelectItem>
                    <SelectItem value="FOOTER_SECTION">Footer Section</SelectItem>
                    <SelectItem value="BRAND_CAROUSEL">Brand Carousel</SelectItem>
                    <SelectItem value="RECENT_BLOG_POSTS">Recent Blog Posts</SelectItem>
                    <SelectItem value="CUSTOM_HTML">Custom HTML / Iframe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Thứ tự xuất hiện (Position)</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={formData.position} 
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })} 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tiêu đề hiển thị (Không bắt buộc)</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="VD: Sản phẩm nổi bật"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label>
                  {isBannerType(formData.type)
                    ? "Banner items"
                    : isCategoriesType(formData.type)
                      ? "Cấu hình danh mục"
                      : isTestimonialsType(formData.type)
                        ? "Cấu hình testimonials"
                        : isNewsletterType(formData.type)
                          ? "Cấu hình newsletter"
                          : isBrandCarouselType(formData.type)
                            ? "Cấu hình brand carousel"
                            : isRecentBlogPostsType(formData.type)
                              ? "Cấu hình bài viết"
                      : "Cấu hình JSON (configJson)"}
                </Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="active-toggle" className="text-xs text-muted-foreground font-normal">Trạng thái bật/tắt</Label>
                  <Switch 
                    id="active-toggle"
                    checked={formData.active} 
                    onCheckedChange={(c) => setFormData({...formData, active: c})} 
                  />
                </div>
              </div>

              {isBannerType(formData.type) ? (
                <div className="space-y-4">
                  {formData.bannerItems.map((banner, index) => (
                    <div key={index} className="rounded-2xl border border-border bg-muted/5 p-4">
                      <div className="flex items-center justify-between mb-3 gap-3">
                        <div className="text-sm font-medium">Banner #{index + 1}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              bannerItems: prev.bannerItems.filter((_, idx) => idx !== index)
                            }));
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Ảnh (URL)</Label>
                          <Input
                            value={banner.image}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                bannerItems: prev.bannerItems.map((item, idx) => idx === index ? { ...item, image: value } : item)
                              }));
                            }}
                            placeholder="https://..."
                            required
                          />
                          <input
                            type="file"
                            accept="image/*"
                            className="mt-2"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadBannerImage(index, file);
                              }
                            }}
                            disabled={uploadingImageIndex === index}
                          />
                          {uploadingImageIndex === index && (
                            <p className="text-sm text-muted-foreground mt-1">Đang tải ảnh...</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Tiêu đề</Label>
                          <Input
                            value={banner.title}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                bannerItems: prev.bannerItems.map((item, idx) => idx === index ? { ...item, title: value } : item)
                              }));
                            }}
                            placeholder="Ví dụ: Ưu đãi lớn"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtitle</Label>
                          <Input
                            value={banner.subtitle}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                bannerItems: prev.bannerItems.map((item, idx) => idx === index ? { ...item, subtitle: value } : item)
                              }));
                            }}
                            placeholder="Ví dụ: Giảm đến 50%"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link đích</Label>
                          <Input
                            value={banner.href}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                bannerItems: prev.bannerItems.map((item, idx) => idx === index ? { ...item, href: value } : item)
                              }));
                            }}
                            placeholder="/sale"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      bannerItems: [...prev.bannerItems, { image: "", title: "", subtitle: "", href: "" }]
                    }));
                  }}>
                    Thêm banner
                  </Button>
                </div>
              ) : isHeroType(formData.type) ? (
                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tiêu đề chính</Label>
                      <Input
                        value={formData.heroTitle}
                        onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                        placeholder="Khám Phá"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phụ đề</Label>
                      <Input
                        value={formData.heroSubtitle}
                        onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                        placeholder="Vẻ Đẹp Toàn Diện"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <Textarea
                      value={formData.heroDescription}
                      onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
                      placeholder="Mô tả động từ database"
                      className="h-[100px]"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Button chính</Label>
                      <Input
                        value={formData.heroPrimaryCtaLabel}
                        onChange={(e) => setFormData({ ...formData, heroPrimaryCtaLabel: e.target.value })}
                        placeholder="Khám phá ngay"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link chính</Label>
                      <Input
                        value={formData.heroPrimaryCtaLink}
                        onChange={(e) => setFormData({ ...formData, heroPrimaryCtaLink: e.target.value })}
                        placeholder="/products"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Button phụ</Label>
                      <Input
                        value={formData.heroSecondaryCtaLabel}
                        onChange={(e) => setFormData({ ...formData, heroSecondaryCtaLabel: e.target.value })}
                        placeholder="Chăm sóc da"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link phụ</Label>
                      <Input
                        value={formData.heroSecondaryCtaLink}
                        onChange={(e) => setFormData({ ...formData, heroSecondaryCtaLink: e.target.value })}
                        placeholder="/category/cham-soc-da"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Banner nhỏ</Label>
                      <Input
                        value={formData.heroBadgeText}
                        onChange={(e) => setFormData({ ...formData, heroBadgeText: e.target.value })}
                        placeholder="Bộ sưu tập Xuân Hè 2026"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ảnh Section</Label>
                      <input
                        type="file"
                        accept="image/*"
                        className="mt-2"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadSectionImage(file);
                        }}
                        disabled={sectionImageUploading}
                      />
                      {sectionImageUploading && <p className="text-sm text-muted-foreground mt-1">Đang tải ảnh...</p>}
                    </div>
                  </div>
                  {sectionImagePreview && (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <img src={sectionImagePreview} alt="preview" className="w-full h-32 object-cover" />
                    </div>
                  )}
                </div>
              ) : isPromoSlideType(formData.type) ? (
                <div className="space-y-4">
                  {/* Custom Tab Navigation */}
                  <div className="flex border-b border-border mb-4">
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        promoTab === "slides"
                          ? "border-primary text-primary font-bold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setPromoTab("slides")}
                    >
                      Slides ({formData.promoSlides.length})
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        promoTab === "sideBanners"
                          ? "border-primary text-primary font-bold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setPromoTab("sideBanners")}
                    >
                      Banners phụ ({formData.promoSideBanners.length})
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        promoTab === "quickLinks"
                          ? "border-primary text-primary font-bold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setPromoTab("quickLinks")}
                    >
                      Quick Links ({formData.promoQuickLinks.length})
                    </button>
                  </div>

                  {/* Render content depending on active tab */}
                  {promoTab === "slides" && (
                    <div className="space-y-4">
                      {formData.promoSlides.map((slide, idx) => (
                        <div key={idx} className="p-4 border rounded-xl bg-muted/20 relative space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">Slide #{idx + 1} (ID: {slide.id})</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 p-0 h-auto"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  promoSlides: prev.promoSlides.filter((_, i) => i !== idx)
                                }));
                              }}
                            >
                              Xóa Slide
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Tiêu đề chính</Label>
                              <Input
                                value={slide.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSlides: prev.promoSlides.map((s, i) => i === idx ? { ...s, title: val } : s)
                                  }));
                                }}
                                placeholder="VD: Flash Sale Mùa Hè"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Phụ đề</Label>
                              <Input
                                value={slide.subtitle}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSlides: prev.promoSlides.map((s, i) => i === idx ? { ...s, subtitle: val } : s)
                                  }));
                                }}
                                placeholder="VD: Giảm đến 50%..."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">CTA text</Label>
                              <Input
                                value={slide.cta}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSlides: prev.promoSlides.map((s, i) => i === idx ? { ...s, cta: val } : s)
                                  }));
                                }}
                                placeholder="VD: Mua ngay"
                              />
                            </div>
                            <div className="space-y-1 col-span-2">
                              <Label className="text-xs">CTA Link (href)</Label>
                              <Input
                                value={slide.href}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSlides: prev.promoSlides.map((s, i) => i === idx ? { ...s, href: val } : s)
                                  }));
                                }}
                                placeholder="VD: /sale"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">Ảnh (URL) & Tải lên</Label>
                            <div className="flex gap-2">
                              <Input
                                value={slide.image}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSlides: prev.promoSlides.map((s, i) => i === idx ? { ...s, image: val } : s)
                                  }));
                                }}
                                placeholder="https://..."
                              />
                              <div className="relative">
                                <Button type="button" variant="outline" size="sm" className="h-10">
                                  {uploadingPromoSlideIndex === idx ? "Đang tải..." : "Chọn ảnh"}
                                </Button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadPromoSlideImage(idx, file);
                                  }}
                                  disabled={uploadingPromoSlideIndex === idx}
                                />
                              </div>
                            </div>
                            {slide.image && (
                              <div className="mt-1 relative w-full h-20 rounded-md overflow-hidden border">
                                <img src={slide.image} alt="preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Trang trí (Accent icon)</Label>
                              <Input
                                value={slide.accent || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSlides: prev.promoSlides.map((s, i) => i === idx ? { ...s, accent: val } : s)
                                  }));
                                }}
                                placeholder="VD: ✿"
                              />
                            </div>
                            <div className="space-y-1 col-span-2">
                              <Label className="text-xs">CSS Gradient background</Label>
                              <Input
                                value={slide.gradient}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSlides: prev.promoSlides.map((s, i) => i === idx ? { ...s, gradient: val } : s)
                                  }));
                                }}
                                placeholder="from-rose-400/40 via-pink-300/30 to-rose-200/40"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Các ký tự trang trí bay bổng (phân cách bằng dấu phẩy)</Label>
                            <Input
                              value={slide.decorations ? slide.decorations.join(", ") : ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const decors = val.split(",").map(d => d.trim()).filter(Boolean);
                                setFormData(prev => ({
                                  ...prev,
                                  promoSlides: prev.promoSlides.map((s, i) => i === idx ? { ...s, decorations: decors } : s)
                                }));
                              }}
                              placeholder="VD: ✦, ♡, ✿, ·"
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => {
                          const nextId = formData.promoSlides.length > 0 ? Math.max(...formData.promoSlides.map(s => s.id)) + 1 : 1;
                          setFormData(prev => ({
                            ...prev,
                            promoSlides: [...prev.promoSlides, {
                              id: nextId,
                              title: "",
                              subtitle: "",
                              cta: "Khám phá",
                              href: "/products",
                              image: "",
                              gradient: "from-rose-400/40 via-pink-300/30 to-rose-200/40",
                              accent: "✿",
                              decorations: ["✦", "♡", "✿", "·"]
                            }]
                          }));
                        }}
                        className="w-full"
                      >
                        + Thêm Slide Mới
                      </Button>
                    </div>
                  )}

                  {promoTab === "sideBanners" && (
                    <div className="space-y-4">
                      {formData.promoSideBanners.map((banner, idx) => (
                        <div key={idx} className="p-4 border rounded-xl bg-muted/20 relative space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">Banner Phụ #{idx + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 p-0 h-auto"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  promoSideBanners: prev.promoSideBanners.filter((_, i) => i !== idx)
                                }));
                              }}
                            >
                              Xóa Banner
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Tiêu đề</Label>
                              <Input
                                value={banner.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSideBanners: prev.promoSideBanners.map((b, i) => i === idx ? { ...b, title: val } : b)
                                  }));
                                }}
                                placeholder="VD: Mua 2 Tặng 1"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Phụ đề</Label>
                              <Input
                                value={banner.subtitle}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSideBanners: prev.promoSideBanners.map((b, i) => i === idx ? { ...b, subtitle: val } : b)
                                  }));
                                }}
                                placeholder="VD: Mặt nạ & Serum"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Đường dẫn khi click (Link)</Label>
                            <Input
                              value={banner.href}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  promoSideBanners: prev.promoSideBanners.map((b, i) => i === idx ? { ...b, href: val } : b)
                                }));
                              }}
                              placeholder="VD: /sale"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">Ảnh (URL) & Tải lên</Label>
                            <div className="flex gap-2">
                              <Input
                                value={banner.image}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSideBanners: prev.promoSideBanners.map((b, i) => i === idx ? { ...b, image: val } : b)
                                  }));
                                }}
                                placeholder="https://..."
                              />
                              <div className="relative">
                                <Button type="button" variant="outline" size="sm" className="h-10">
                                  {uploadingPromoSideBannerIndex === idx ? "Đang tải..." : "Chọn ảnh"}
                                </Button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadPromoSideBannerImage(idx, file);
                                  }}
                                  disabled={uploadingPromoSideBannerIndex === idx}
                                />
                              </div>
                            </div>
                            {banner.image && (
                              <div className="mt-1 relative w-full h-20 rounded-md overflow-hidden border">
                                <img src={banner.image} alt="preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Trang trí (Accent icon)</Label>
                              <Input
                                value={banner.accent || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSideBanners: prev.promoSideBanners.map((b, i) => i === idx ? { ...b, accent: val } : b)
                                  }));
                                }}
                                placeholder="VD: ❀"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">CSS Gradient background</Label>
                              <Input
                                value={banner.gradient}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoSideBanners: prev.promoSideBanners.map((b, i) => i === idx ? { ...b, gradient: val } : b)
                                  }));
                                }}
                                placeholder="from-fuchsia-400/60 via-pink-400/50 to-rose-300/60"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            promoSideBanners: [...prev.promoSideBanners, {
                              title: "",
                              subtitle: "",
                              href: "/products",
                              image: "",
                              gradient: "from-sky-400/60 via-blue-300/50 to-indigo-300/60",
                              accent: "✦"
                            }]
                          }));
                        }}
                        className="w-full"
                      >
                        + Thêm Banner Mới
                      </Button>
                    </div>
                  )}

                  {promoTab === "quickLinks" && (
                    <div className="space-y-4">
                      {formData.promoQuickLinks.map((link, idx) => (
                        <div key={idx} className="p-4 border rounded-xl bg-muted/20 relative space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">Quick Link #{idx + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 p-0 h-auto"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  promoQuickLinks: prev.promoQuickLinks.filter((_, i) => i !== idx)
                                }));
                              }}
                            >
                              Xóa Link
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Chọn Icon</Label>
                              <Select
                                value={link.iconName}
                                onValueChange={(val) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    promoQuickLinks: prev.promoQuickLinks.map((l, i) => i === idx ? { ...l, iconName: val } : l)
                                  }));
                                }}
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="Chọn icon..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Droplets">Droplets (Giọt nước)</SelectItem>
                                  <SelectItem value="Sun">Sun (Mặt trời)</SelectItem>
                                  <SelectItem value="Sparkles">Sparkles (Lấp lánh)</SelectItem>
                                  <SelectItem value="Heart">Heart (Trái tim)</SelectItem>
                                  <SelectItem value="Flower2">Flower2 (Hoa mẫu 2)</SelectItem>
                                  <SelectItem value="Palette">Palette (Bảng màu)</SelectItem>
                                  <SelectItem value="ShieldCheck">ShieldCheck (Khiên bảo vệ)</SelectItem>
                                  <SelectItem value="Gift">Gift (Hộp quà)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Nhãn hiển thị</Label>
                              <Input
                                value={link.label}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoQuickLinks: prev.promoQuickLinks.map((l, i) => i === idx ? { ...l, label: val } : l)
                                  }));
                                }}
                                placeholder="VD: Chăm sóc da"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Đường dẫn Link</Label>
                              <Input
                                value={link.href}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData(prev => ({
                                    ...prev,
                                    promoQuickLinks: prev.promoQuickLinks.map((l, i) => i === idx ? { ...l, href: val } : l)
                                  }));
                                }}
                                placeholder="VD: /category/cham-soc-da"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            promoQuickLinks: [...prev.promoQuickLinks, {
                              iconName: "ShieldCheck",
                              label: "",
                              href: "/products"
                            }]
                          }));
                        }}
                        className="w-full"
                      >
                        + Thêm Link Nhanh Mới
                      </Button>
                    </div>
                  )}
                </div>
              ) : isCategoriesType(formData.type) ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mô tả section</Label>
                    <Textarea
                      rows={3}
                      value={formData.categoryDescription}
                      onChange={(e) => setFormData({ ...formData, categoryDescription: e.target.value })}
                      placeholder="Mô tả ngắn hiển thị dưới tiêu đề"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Giới hạn số danh mục</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.categoryLimit}
                        onChange={(e) => setFormData({ ...formData, categoryLimit: e.target.value })}
                        placeholder="Bỏ trống để hiển thị tất cả"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Autoplay delay (ms)</Label>
                      <Input
                        type="number"
                        min="500"
                        step="100"
                        value={formData.categoryAutoplayDelay}
                        onChange={(e) => setFormData({ ...formData, categoryAutoplayDelay: e.target.value })}
                        placeholder="3000"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label>Chỉ hiển thị danh mục gốc</Label>
                      <Switch
                        checked={formData.categoryOnlyRoot}
                        onCheckedChange={(checked) => setFormData({ ...formData, categoryOnlyRoot: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label>Hiển thị số sản phẩm</Label>
                      <Switch
                        checked={formData.categoryShowProductCount}
                        onCheckedChange={(checked) => setFormData({ ...formData, categoryShowProductCount: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label>Hiển thị nút điều hướng</Label>
                      <Switch
                        checked={formData.categoryShowNavigation}
                        onCheckedChange={(checked) => setFormData({ ...formData, categoryShowNavigation: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label>Hiển thị dots</Label>
                      <Switch
                        checked={formData.categoryShowDots}
                        onCheckedChange={(checked) => setFormData({ ...formData, categoryShowDots: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label>Tự động chạy carousel</Label>
                      <Switch
                        checked={formData.categoryAutoplay}
                        onCheckedChange={(checked) => setFormData({ ...formData, categoryAutoplay: checked })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label>Danh mục hiển thị ({formData.categoryIds.length} đã chọn)</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            categoryIds: availableCategories.map(category => category.id),
                          }))}
                          disabled={categoriesLoading || availableCategories.length === 0}
                        >
                          Chọn tất cả
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, categoryIds: [] }))}
                        >
                          Bỏ chọn
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto rounded-lg border p-3">
                      {categoriesLoading ? (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang tải danh mục...
                        </div>
                      ) : availableCategories.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          Chưa có danh mục để chọn.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {availableCategories.map((category) => {
                            const checked = formData.categoryIds.includes(category.id);
                            return (
                              <label
                                key={category.id}
                                className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted/60"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(value) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        categoryIds: value === true
                                          ? Array.from(new Set([...prev.categoryIds, category.id]))
                                          : prev.categoryIds.filter(id => id !== category.id),
                                      }));
                                    }}
                                  />
                                  <span className="truncate text-sm">
                                    {category.level ? `${"--".repeat(category.level)} ` : ""}{category.name}
                                  </span>
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                  {category.productCount} SP
                                </Badge>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bỏ chọn tất cả để section tự động hiển thị mọi danh mục đang có trong database.
                    </p>
                  </div>
                </div>
              ) : isTestimonialsType(formData.type) ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mô tả section</Label>
                    <Textarea
                      rows={3}
                      value={formData.testimonialsDescription}
                      onChange={(e) => setFormData({ ...formData, testimonialsDescription: e.target.value })}
                    />
                  </div>

                  {formData.testimonialItems.map((item, idx) => (
                    <div key={idx} className="space-y-3 rounded-lg border bg-muted/10 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Đánh giá #{idx + 1}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            testimonialItems: prev.testimonialItems.filter((_, i) => i !== idx)
                          }))}
                        >
                          Xóa
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Tên khách hàng</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                testimonialItems: prev.testimonialItems.map((testimonial, i) => i === idx ? { ...testimonial, name: value } : testimonial)
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Sản phẩm / ghi chú</Label>
                          <Input
                            value={item.product}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                testimonialItems: prev.testimonialItems.map((testimonial, i) => i === idx ? { ...testimonial, product: value } : testimonial)
                              }));
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nội dung đánh giá</Label>
                        <Textarea
                          rows={3}
                          value={item.content}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              testimonialItems: prev.testimonialItems.map((testimonial, i) => i === idx ? { ...testimonial, content: value } : testimonial)
                            }));
                          }}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                        <div className="space-y-1">
                          <Label className="text-xs">Rating</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={item.rating}
                            onChange={(e) => {
                              const value = normalizeNumber(e.target.value, 5);
                              setFormData(prev => ({
                                ...prev,
                                testimonialItems: prev.testimonialItems.map((testimonial, i) => i === idx ? { ...testimonial, rating: value } : testimonial)
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Avatar URL</Label>
                          <Input
                            value={item.avatar}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                testimonialItems: prev.testimonialItems.map((testimonial, i) => i === idx ? { ...testimonial, avatar: value } : testimonial)
                              }));
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            className="text-xs"
                            disabled={uploadingTestimonialIndex === idx}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadTestimonialAvatar(idx, file);
                            }}
                          />
                          {uploadingTestimonialIndex === idx && <p className="text-xs text-muted-foreground">Đang tải avatar...</p>}
                        </div>
                      </div>
                      {item.avatar && (
                        <img src={item.avatar} alt="testimonial avatar preview" className="h-14 w-14 rounded-full object-cover border" />
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      testimonialItems: [
                        ...prev.testimonialItems,
                        { id: `test_${Date.now()}`, name: "", avatar: "", rating: 5, content: "", product: "" }
                      ]
                    }))}
                  >
                    + Thêm đánh giá
                  </Button>
                </div>
              ) : isNewsletterType(formData.type) ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <Textarea
                      rows={3}
                      value={formData.newsletterDescription}
                      onChange={(e) => setFormData({ ...formData, newsletterDescription: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Placeholder email</Label>
                      <Input
                        value={formData.newsletterPlaceholder}
                        onChange={(e) => setFormData({ ...formData, newsletterPlaceholder: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nút đăng ký</Label>
                      <Input
                        value={formData.newsletterButton}
                        onChange={(e) => setFormData({ ...formData, newsletterButton: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú riêng tư</Label>
                    <Textarea
                      rows={2}
                      value={formData.newsletterPrivacyNote}
                      onChange={(e) => setFormData({ ...formData, newsletterPrivacyNote: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Toast thành công</Label>
                      <Input
                        value={formData.newsletterSuccessTitle}
                        onChange={(e) => setFormData({ ...formData, newsletterSuccessTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả toast</Label>
                      <Input
                        value={formData.newsletterSuccessDescription}
                        onChange={(e) => setFormData({ ...formData, newsletterSuccessDescription: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : isBrandCarouselType(formData.type) ? (
                <div className="space-y-4">
                  {formData.brandItems.map((item, idx) => (
                    <div key={idx} className="space-y-3 rounded-lg border bg-muted/10 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Thương hiệu #{idx + 1}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            brandItems: prev.brandItems.filter((_, i) => i !== idx)
                          }))}
                        >
                          Xóa
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Tên thương hiệu</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                brandItems: prev.brandItems.map((brand, i) => i === idx ? { ...brand, name: value } : brand)
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Logo URL</Label>
                          <Input
                            value={item.logo}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                brandItems: prev.brandItems.map((brand, i) => i === idx ? { ...brand, logo: value } : brand)
                              }));
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            className="text-xs"
                            disabled={uploadingBrandIndex === idx}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadBrandLogo(idx, file);
                            }}
                          />
                          {uploadingBrandIndex === idx && <p className="text-xs text-muted-foreground">Đang tải logo...</p>}
                        </div>
                      </div>
                      {item.logo && (
                        <img src={item.logo} alt="brand logo preview" className="h-14 w-14 rounded-full object-cover border" />
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      brandItems: [...prev.brandItems, { name: "", logo: "" }]
                    }))}
                  >
                    + Thêm thương hiệu
                  </Button>
                </div>
              ) : isRecentBlogPostsType(formData.type) ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mô tả section</Label>
                    <Textarea
                      rows={3}
                      value={formData.blogDescription}
                      onChange={(e) => setFormData({ ...formData, blogDescription: e.target.value })}
                    />
                  </div>

                  {formData.blogPosts.map((item, idx) => (
                    <div key={idx} className="space-y-3 rounded-lg border bg-muted/10 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Bài viết #{idx + 1}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            blogPosts: prev.blogPosts.filter((_, i) => i !== idx)
                          }))}
                        >
                          Xóa
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tiêu đề</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              blogPosts: prev.blogPosts.map((post, i) => i === idx ? { ...post, title: value } : post)
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Mô tả ngắn</Label>
                        <Textarea
                          rows={3}
                          value={item.excerpt}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              blogPosts: prev.blogPosts.map((post, i) => i === idx ? { ...post, excerpt: value } : post)
                            }));
                          }}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Ngày hiển thị</Label>
                          <Input
                            value={item.date}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                blogPosts: prev.blogPosts.map((post, i) => i === idx ? { ...post, date: value } : post)
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Thời gian đọc</Label>
                          <Input
                            value={item.readTime}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                blogPosts: prev.blogPosts.map((post, i) => i === idx ? { ...post, readTime: value } : post)
                              }));
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Ảnh bài viết URL</Label>
                        <Input
                          value={item.image}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              blogPosts: prev.blogPosts.map((post, i) => i === idx ? { ...post, image: value } : post)
                            }));
                          }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          className="text-xs"
                          disabled={uploadingBlogPostIndex === idx}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadBlogPostImage(idx, file);
                          }}
                        />
                        {uploadingBlogPostIndex === idx && <p className="text-xs text-muted-foreground">Đang tải ảnh...</p>}
                      </div>
                      {item.image && (
                        <img src={item.image} alt="blog post preview" className="h-24 w-full rounded-md object-cover border" />
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      blogPosts: [...prev.blogPosts, { title: "", excerpt: "", image: "", date: "", readTime: "" }]
                    }))}
                  >
                    + Thêm bài viết
                  </Button>
                </div>
              ) : isHeaderType(formData.type) ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tên logo</Label>
                      <Input
                        value={formData.headerLogoText}
                        onChange={(e) => setFormData({ ...formData, headerLogoText: e.target.value })}
                        placeholder="GlowSkin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Thông báo top bar</Label>
                      <Input
                        value={formData.headerTopBarText}
                        onChange={(e) => setFormData({ ...formData, headerTopBarText: e.target.value })}
                        placeholder="Miễn phí vận chuyển..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Hiển thị top bar</Label>
                    <Switch
                      checked={formData.headerShowTopBar}
                      onCheckedChange={(checked) => setFormData({ ...formData, headerShowTopBar: checked })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Menu điều hướng</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          headerNavItems: [...prev.headerNavItems, { name: "", href: "/", highlight: false }]
                        }))}
                      >
                        Thêm menu
                      </Button>
                    </div>

                    {formData.headerNavItems.map((item, idx) => (
                      <div key={idx} className="grid gap-3 rounded-lg border bg-muted/10 p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
                        <div className="space-y-1">
                          <Label className="text-xs">Tên menu</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                headerNavItems: prev.headerNavItems.map((nav, i) => i === idx ? { ...nav, name: value } : nav)
                              }));
                            }}
                            placeholder="Sản phẩm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Đường dẫn</Label>
                          <Input
                            value={item.href}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                headerNavItems: prev.headerNavItems.map((nav, i) => i === idx ? { ...nav, href: value } : nav)
                              }));
                            }}
                            placeholder="/products"
                          />
                        </div>
                        <div className="flex items-end gap-2 pb-2">
                          <Switch
                            checked={item.highlight}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                headerNavItems: prev.headerNavItems.map((nav, i) => i === idx ? { ...nav, highlight: checked } : nav)
                              }));
                            }}
                          />
                          <span className="text-xs text-muted-foreground">Nổi bật</span>
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              headerNavItems: prev.headerNavItems.filter((_, i) => i !== idx)
                            }))}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isFooterType(formData.type) ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tên cửa hàng</Label>
                      <Input value={formData.footerStoreName} onChange={(e) => setFormData({ ...formData, footerStoreName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email liên hệ</Label>
                      <Input value={formData.footerContactEmail} onChange={(e) => setFormData({ ...formData, footerContactEmail: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input value={formData.footerContactPhone} onChange={(e) => setFormData({ ...formData, footerContactPhone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phương thức thanh toán</Label>
                      <Input value={formData.footerPaymentMethods} onChange={(e) => setFormData({ ...formData, footerPaymentMethods: e.target.value })} placeholder="VISA,MC,MoMo,VNP" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Địa chỉ</Label>
                    <Textarea rows={2} value={formData.footerStoreAddress} onChange={(e) => setFormData({ ...formData, footerStoreAddress: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả footer</Label>
                    <Textarea rows={3} value={formData.footerStoreDescription} onChange={(e) => setFormData({ ...formData, footerStoreDescription: e.target.value })} />
                  </div>
                  <div className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Hiển thị newsletter</Label>
                      <Switch checked={formData.footerShowNewsletter} onCheckedChange={(checked) => setFormData({ ...formData, footerShowNewsletter: checked })} />
                    </div>
                    <Input value={formData.footerNewsletterTitle} onChange={(e) => setFormData({ ...formData, footerNewsletterTitle: e.target.value })} placeholder="Tiêu đề newsletter" />
                    <Textarea rows={2} value={formData.footerNewsletterDescription} onChange={(e) => setFormData({ ...formData, footerNewsletterDescription: e.target.value })} placeholder="Mô tả newsletter" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input value={formData.footerNewsletterPlaceholder} onChange={(e) => setFormData({ ...formData, footerNewsletterPlaceholder: e.target.value })} placeholder="Placeholder email" />
                      <Input value={formData.footerNewsletterButton} onChange={(e) => setFormData({ ...formData, footerNewsletterButton: e.target.value })} placeholder="Nút đăng ký" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input value={formData.footerSocialFacebookUrl} onChange={(e) => setFormData({ ...formData, footerSocialFacebookUrl: e.target.value })} placeholder="Facebook URL" />
                    <Input value={formData.footerSocialInstagramUrl} onChange={(e) => setFormData({ ...formData, footerSocialInstagramUrl: e.target.value })} placeholder="Instagram URL" />
                    <Input value={formData.footerSocialYoutubeUrl} onChange={(e) => setFormData({ ...formData, footerSocialYoutubeUrl: e.target.value })} placeholder="Youtube URL" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cột link footer (JSON)</Label>
                    <Textarea className="font-mono text-xs h-[180px]" value={formData.footerLinksJsonStr} onChange={(e) => setFormData({ ...formData, footerLinksJsonStr: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Thanh lợi ích footer (JSON)</Label>
                    <Textarea className="font-mono text-xs h-[140px]" value={formData.footerFeaturesJsonStr} onChange={(e) => setFormData({ ...formData, footerFeaturesJsonStr: e.target.value })} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <Label>Ảnh Section (tùy chọn)</Label>
                    {sectionImagePreview && (
                      <div className="mt-2 mb-2">
                        <img src={sectionImagePreview} alt="preview" className="max-h-40 rounded" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadSectionImage(file);
                      }}
                      disabled={sectionImageUploading}
                    />
                    {sectionImageUploading && <p className="text-sm text-muted-foreground mt-1">Đang tải ảnh section...</p>}
                  </div>
                  <Textarea
                    className="font-mono text-sm h-[200px]"
                    value={formData.configJsonStr}
                    onChange={(e) => {
                      setFormData({ ...formData, configJsonStr: e.target.value });
                      setJsonError(null);
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Ví dụ: {`{"filter": "bestseller", "backgroundColor": "#f87171"}`}</p>
                </>
              )}

              {jsonError && (
                <p className="text-sm text-red-500 font-medium mt-1">{jsonError}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu cấu hình
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
