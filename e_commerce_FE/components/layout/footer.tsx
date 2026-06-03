"use client";

import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/api";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, CreditCard, Truck, Shield, RotateCcw } from "lucide-react";

export type FooterLink = {
  name: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterFeature = {
  iconName: string;
  title: string;
  description: string;
};

export type FooterConfig = {
  storeName?: string;
  storeDescription?: string;
  storeAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterPlaceholder?: string;
  newsletterButton?: string;
  socialFacebookUrl?: string;
  socialInstagramUrl?: string;
  socialYoutubeUrl?: string;
  paymentMethods?: string[];
  links?: Record<string, FooterColumn>;
  features?: FooterFeature[];
};

const defaultFooterLinks: Record<string, FooterColumn> = {
  shop: {
    title: "Mua sắm",
    links: [
      { name: "Tất cả sản phẩm", href: "/products" },
      { name: "Chăm sóc da", href: "/category/cham-soc-da" },
      { name: "Trang điểm", href: "/category/trang-diem" },
      { name: "Chống nắng", href: "/category/chong-nang" },
      { name: "Sản phẩm mới", href: "/products?filter=new" },
      { name: "Bán chạy", href: "/products?filter=bestseller" },
    ],
  },
  support: {
    title: "Hỗ trợ",
    links: [
      { name: "Hướng dẫn mua hàng", href: "/help/how-to-buy" },
      { name: "Phương thức thanh toán", href: "/help/payment" },
      { name: "Vận chuyển", href: "/help/shipping" },
      { name: "Đổi trả và hoàn tiền", href: "/help/returns" },
      { name: "Câu hỏi thường gặp", href: "/help/faq" },
      { name: "Liên hệ", href: "/contact" },
    ],
  },
  company: {
    title: "Về chúng tôi",
    links: [
      { name: "Giới thiệu", href: "/about" },
      { name: "Tuyển dụng", href: "/careers" },
      { name: "Blog làm đẹp", href: "/blog" },
      { name: "Điều khoản sử dụng", href: "/terms" },
      { name: "Chính sách bảo mật", href: "/privacy" },
    ],
  },
};

const defaultFeatures: FooterFeature[] = [
  {
    iconName: "Truck",
    title: "Miễn phí vận chuyển",
    description: "Đơn hàng từ 500.000đ",
  },
  {
    iconName: "RotateCcw",
    title: "Đổi trả 30 ngày",
    description: "Không cần lý do",
  },
  {
    iconName: "Shield",
    title: "Chính hãng 100%",
    description: "Cam kết chất lượng",
  },
  {
    iconName: "CreditCard",
    title: "Thanh toán an toàn",
    description: "Bảo mật tuyệt đối",
  },
];

const featureIcons = {
  Truck,
  RotateCcw,
  Shield,
  CreditCard,
};

function parseJsonSetting<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function Footer({ config }: { config?: FooterConfig }) {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchSettings();
        const settingsMap = data.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {} as Record<string, string>);
        setSettings(settingsMap);
      } catch (err) {
        console.error("Failed to load storefront footer settings:", err);
      }
    }
    loadSettings();
  }, []);

  const footerLinks = config?.links || parseJsonSetting(settings["footer_links_json"], defaultFooterLinks);
  const features = config?.features || parseJsonSetting(settings["footer_features_json"], defaultFeatures);
  const paymentMethods = config?.paymentMethods || (settings["footer_payment_methods"] || "VISA,MC,MoMo,VNP")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const showNewsletter = config?.showNewsletter ?? settings["footer_show_newsletter"] !== "false";
  const storeName = config?.storeName || settings["store_name"] || "GlowSkin";
  const storeDescription = config?.storeDescription || settings["store_description"] || "Khám phá vẻ đẹp toàn diện với các sản phẩm mỹ phẩm cao cấp, chính hãng từ các thương hiệu hàng đầu thế giới.";
  const storeAddress = config?.storeAddress || settings["store_address"] || "123 Nguyễn Huệ, Quận 1, TP.HCM";
  const contactPhone = config?.contactPhone || settings["contact_phone"] || "1900 1234 56";
  const contactEmail = config?.contactEmail || settings["contact_email"] || "support@glowskin.vn";

  return (
    <footer className="bg-gradient-to-b from-secondary/15 via-muted/40 to-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-8 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = featureIcons[feature.iconName as keyof typeof featureIcons] || Truck;

            return (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-bold text-primary">{storeName}</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              {storeDescription}
            </p>

            {showNewsletter && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">{config?.newsletterTitle || settings["footer_newsletter_title"] || "Đăng ký nhận tin"}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {config?.newsletterDescription || settings["footer_newsletter_description"] || "Nhận ưu đãi độc quyền và cập nhật xu hướng làm đẹp mới nhất."}
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={config?.newsletterPlaceholder || settings["footer_newsletter_placeholder"] || "Email của bạn"}
                    className="flex-1 bg-background"
                  />
                  <Button>{config?.newsletterButton || settings["footer_newsletter_button"] || "Đăng ký"}</Button>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <a
                href={config?.socialFacebookUrl || settings["social_facebook_url"] || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={config?.socialInstagramUrl || settings["social_instagram_url"] || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={config?.socialYoutubeUrl || settings["social_youtube_url"] || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={`${link.name}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 border-t border-border">
        <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{storeAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span>{contactPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>{contactEmail}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {storeName}. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <span>Thanh toán:</span>
            <div className="flex gap-2">
              {paymentMethods.map((method) => (
                <div key={method} className="min-w-10 h-6 px-2 bg-background border border-border rounded flex items-center justify-center text-xs font-medium">
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
