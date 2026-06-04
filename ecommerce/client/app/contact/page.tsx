"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPageBySlug, PageResponseDTO, fetchSettings } from "@/lib/api";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  Facebook,
  Instagram,
} from "lucide-react";

// Removed static contactInfo

const faqs = [
  {
    question: "Làm sao để theo dõi đơn hàng?",
    answer: "Bạn có thể theo dõi đơn hàng trong mục 'Đơn hàng của tôi' sau khi đăng nhập, hoặc sử dụng mã đơn hàng để tra cứu.",
  },
  {
    question: "Chính sách đổi trả như thế nào?",
    answer: "GlowSkin hỗ trợ đổi trả trong vòng 30 ngày kể từ ngày nhận hàng với sản phẩm chưa qua sử dụng và còn nguyên tem mác.",
  },
  {
    question: "Thời gian giao hàng mất bao lâu?",
    answer: "Nội thành TP.HCM: 1-2 ngày. Các tỉnh thành khác: 3-5 ngày làm việc. Miễn phí ship cho đơn hàng từ 500.000đ.",
  },
  {
    question: "Sản phẩm có bảo hành không?",
    answer: "Tất cả sản phẩm đều chính hãng 100% và được bảo hành theo chính sách của nhà sản xuất.",
  },
];

export default function ContactPage() {
  const [dbPage, setDbPage] = useState<PageResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [pageData, settingsData] = await Promise.all([
          fetchPageBySlug("contact").catch(() => null),
          fetchSettings().catch(() => [])
        ]);
        
        if (pageData) {
          setDbPage(pageData);
        }
        
        if (settingsData && settingsData.length > 0) {
          const settingsMap = settingsData.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});
          setSettings(settingsMap);
        }
      } catch (error) {
        console.error("Failed to load contact page data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const dynamicContactInfo = [
    {
      icon: MapPin,
      title: "Địa chỉ",
      content: settings["store_address"] || "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      link: "https://maps.google.com",
    },
    {
      icon: Phone,
      title: "Điện thoại",
      content: settings["contact_phone"] || "1900 1234 (8:00 - 22:00)",
      link: `tel:${settings["contact_phone"]?.replace(/\D/g, "") || "19001234"}`,
    },
    {
      icon: Mail,
      title: "Email",
      content: settings["contact_email"] || "support@glowskin.vn",
      link: `mailto:${settings["contact_email"] || "support@glowskin.vn"}`,
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      content: settings["contact_working_hours"] || "T2 - CN: 8:00 - 22:00",
      link: null,
    },
  ];

  const getSection = (type: string, titlePattern?: string) => {
    return dbPage?.sections.find(s => {
      if (s.type !== type) return false;
      if (titlePattern && s.title) {
        return s.title.toLowerCase().includes(titlePattern.toLowerCase());
      }
      return true;
    });
  };

  const heroSec = getSection("HERO_SECTION");
  const contactMapSec = getSection("CUSTOM_HTML");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        {(!dbPage || !!heroSec) && (
          <section 
            style={heroSec?.configJson?.backgroundColor ? { backgroundColor: heroSec.configJson.backgroundColor, backgroundImage: "none" } : {}}
            className="bg-gradient-to-br from-primary-light via-background to-secondary/30 py-10 lg:py-14"
          >
            <div className="container mx-auto px-4 text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                {heroSec?.title || "Liên Hệ Chúng Tôi"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {heroSec?.configJson?.subtitle || "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với GlowSkin bất cứ khi nào bạn cần."}
              </p>
            </div>
          </section>
        )}

        {/* Contact Info Cards */}
        <section className="py-12 -mt-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicContactInfo.map((info, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{info.title}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">{info.content}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        {(!dbPage || !!contactMapSec) && (
          <section className="py-10 lg:py-16">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Form */}
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-2">Gửi Tin Nhắn</h2>
                  <p className="text-muted-foreground mb-8">
                    Điền đầy đủ thông tin và chúng tôi sẽ phản hồi trong vòng 24 giờ.
                  </p>

                  {isSubmitted ? (
                    <Card className="border-success/30 bg-success-light">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-success" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Gửi thành công!</h3>
                            <p className="text-muted-foreground">
                              Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.
                            </p>
                          </div>
                        </div>
                        <Button
                          className="mt-6 bg-transparent"
                          variant="outline"
                          onClick={() => setIsSubmitted(false)}
                        >
                          Gửi tin nhắn khác
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Họ và tên *</Label>
                          <Input
                            id="name"
                            placeholder="Nguyen Van A"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <Input
                            id="phone"
                            placeholder="0901 234 567"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Chủ đề *</Label>
                          <Select
                            value={formData.subject}
                            onValueChange={(value) =>
                              setFormData({ ...formData, subject: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn chủ đề" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="order">Thắc mắc về đơn hàng</SelectItem>
                              <SelectItem value="product">Tư vấn sản phẩm</SelectItem>
                              <SelectItem value="return">Đổi trả hàng</SelectItem>
                              <SelectItem value="cooperation">Hợp tác kinh doanh</SelectItem>
                              <SelectItem value="other">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Nội dung *</Label>
                        <Textarea
                          id="message"
                          placeholder="Nhập nội dung tin nhắn của bạn..."
                          rows={5}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Gửi tin nhắn
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>

                {/* Map & Social */}
                <div className="space-y-8">
                  {contactMapSec?.configJson?.html ? (
                    <div dangerouslySetInnerHTML={{ __html: contactMapSec.configJson.html }} />
                  ) : (
                    <div className="rounded-2xl overflow-hidden h-[300px] lg:h-[400px] bg-muted relative">
                      <iframe
                        src={settings["contact_map_iframe"] || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4469!2d106.7000!3d10.7730!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzIyLjgiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1sen!2s!4v1234567890"}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="GlowSkin Store Location"
                      ></iframe>
                    </div>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Kết nối với chúng tôi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Theo dõi GlowSkin trên mạng xã hội để cập nhật những ưu đãi mới nhất.
                      </p>
                      <div className="flex gap-3">
                        <Button variant="outline" size="icon" asChild className="bg-transparent">
                          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-5 w-5" />
                          </a>
                        </Button>
                        <Button variant="outline" size="icon" asChild className="bg-transparent">
                          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-5 w-5" />
                          </a>
                        </Button>
                        <Button variant="outline" size="icon" asChild className="bg-transparent">
                          <a href="https://zalo.me" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-5 w-5" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="py-10 lg:py-16 bg-gradient-to-b from-secondary/12 via-primary-light/8 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Câu Hỏi Thường Gặp
              </h2>
              <p className="text-muted-foreground">
                Những câu hỏi được hỏi nhiều nhất từ khách hàng
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Không tìm thấy câu trả lời bạn cần?
              </p>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/help">Xem thêm FAQ</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
