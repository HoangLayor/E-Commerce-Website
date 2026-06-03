"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShopLocationsSection } from "@/components/home/shop-locations-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchPageBySlug, PageResponseDTO } from "@/lib/api";
import { Loader2 } from "lucide-react";
import {
  Heart,
  Leaf,
  Shield,
  Award,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "Tự nhiên & An toàn",
    description:
      "Cam kết sử dụng nguyên liệu tự nhiên, không thử nghiệm trên động vật và an toàn cho mọi loại da.",
  },
  {
    icon: Shield,
    title: "Chính hãng 100%",
    description:
      "Tất cả sản phẩm đều chính hãng, có nguồn gốc rõ ràng và được kiểm định chất lượng nghiêm ngặt.",
  },
  {
    icon: Heart,
    title: "Khách hàng là trọng tâm",
    description:
      "Đặt lợi ích và sự hài lòng của khách hàng lên hàng đầu trong mọi hoạt động kinh doanh.",
  },
  {
    icon: Award,
    title: "Chất lượng vượt trội",
    description:
      "Hợp tác với các thương hiệu quốc tế hàng đầu để mang đến sản phẩm chất lượng tốt nhất.",
  },
];

const milestones = [
  { year: "2018", title: "Thành lập", description: "GlowSkin ra đời với cửa hàng đầu tiên tại TP.HCM" },
  { year: "2020", title: "Mở rộng", description: "Khai trương website và hệ thống vận chuyển toàn quốc" },
  { year: "2022", title: "100K khách", description: "Cán mốc 100.000 khách hàng thân thiết" },
  { year: "2024", title: "Top 10", description: "Lọt top 10 thương hiệu mỹ phẩm được yêu thích nhất" },
  { year: "2026", title: "Hiện tại", description: "Hơn 500.000 khách hàng và 50+ thương hiệu đối tác" },
];

const team = [
  {
    name: "Tướng Thị Chình",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop",
    bio: "10+ năm kinh nghiệm trong ngành làm đẹp",
  },
  {
    name: "Nguyễn Khắc Gia Hoàng",
    role: "COO",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
    bio: "Chuyên gia quản lý chuỗi cung ứng",
  },
  {
    name: "Tướng Thị Chình",
    role: "Beauty Director",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    bio: "Chuyên gia tư vấn làm đẹp quốc tế",
  },
  {
    name: "Nguyễn Khắc Gia Hoàng",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    bio: "Chuyên gia công nghệ thương mại điện tử",
  },
];

export default function AboutPage() {
  const [dbPage, setDbPage] = useState<PageResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const data = await fetchPageBySlug("about");
        setDbPage(data);
      } catch (error) {
        console.error("Failed to load DB page:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, []);

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
  const missionSec = getSection("BENEFITS", "sứ mệnh");
  const valuesSec = getSection("BENEFITS", "giá trị");
  const timelineSec = getSection("CUSTOM_HTML", "hành trình");
  const teamSec = getSection("TESTIMONIALS");

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
        {/* Hero Section */}
        {(!dbPage || !!heroSec) && (
          <section
            style={heroSec?.configJson?.backgroundColor ? { backgroundColor: heroSec.configJson.backgroundColor, backgroundImage: "none" } : {}}
            className="relative bg-gradient-to-br from-primary-light via-background to-secondary/30 py-12 lg:py-16"
          >
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  <span>{heroSec?.configJson?.subtitle || "Từ năm 2018"}</span>
                </div>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
                  {heroSec?.title || "Khám Phá Câu Chuyện GlowSkin"}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                  {heroSec?.configJson?.description || "Chúng tôi tin rằng mọi phụ nữ đều xứng đáng có làn da khỏe đẹp và tự tin. GlowSkin ra đời với sứ mệnh mang đến những sản phẩm mỹ phẩm chất lượng nhất, an toàn nhất cho phụ nữ Việt Nam."}
                </p>
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
          </section>
        )}

        {/* Mission & Vision */}
        {(!dbPage || !!missionSec) && (
          <section className="py-10 lg:py-16">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop"
                      alt="GlowSkin team"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-card rounded-xl shadow-lg p-6 max-w-xs hidden md:block">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">500K+</p>
                        <p className="text-sm text-muted-foreground">Khách hàng tin tưởng</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                    {missionSec?.title || "Sứ Mệnh & Tầm Nhìn"}
                  </h2>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Sứ mệnh</h3>
                        <p className="text-muted-foreground">
                          Mang đến cho phụ nữ Việt Nam những sản phẩm mỹ phẩm chất lượng quốc tế với giá cả hợp lý, giúp họ tự tin tỏa sáng mỗi ngày.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Tầm nhìn</h3>
                        <p className="text-muted-foreground">
                          Trở thành thương hiệu mỹ phẩm hàng đầu Đông Nam Á, là điểm đến tin cậy của mọi phụ nữ khi tìm kiếm vẻ đẹp hoàn hảo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Values */}
        {(!dbPage || !!valuesSec) && (
          <section className="py-10 lg:py-16 bg-gradient-to-b from-secondary/15 via-primary-light/10 to-background">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                  {valuesSec?.title || "Giá Trị Cốt Lõi"}
                </h2>
                <p className="text-muted-foreground">
                  Những giá trị mà chúng tôi theo đuổi trong mọi hoạt động
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                      <p className="text-muted-foreground text-sm">{value.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Timeline */}
        {(!dbPage || !!timelineSec) && (
          <section className="py-10 lg:py-16">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                  {timelineSec?.title || "Hành Trình Phát Triển"}
                </h2>
                <p className="text-muted-foreground">
                  Những cột mốc quan trọng trong lịch sử GlowSkin
                </p>
              </div>

              {timelineSec?.configJson?.html ? (
                <div dangerouslySetInnerHTML={{ __html: timelineSec.configJson.html }} />
              ) : (
                <div className="relative max-w-4xl mx-auto">
                  {/* Timeline line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block"></div>

                  <div className="space-y-8">
                    {milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className={`flex flex-col md:flex-row gap-4 md:gap-8 ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                          }`}
                      >
                        <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                          <div className="bg-card rounded-xl p-6 shadow-sm border">
                            <span className="text-primary font-bold text-xl">{milestone.year}</span>
                            <h3 className="font-semibold text-lg mt-1">{milestone.title}</h3>
                            <p className="text-muted-foreground text-sm mt-2">{milestone.description}</p>
                          </div>
                        </div>

                        {/* Center dot */}
                        <div className="hidden md:flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow"></div>
                        </div>

                        <div className="flex-1"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Team */}
        {(!dbPage || !!teamSec) && (
          <section className="py-10 lg:py-16 bg-gradient-to-b from-background via-primary-light/10 to-secondary/15">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                  {teamSec?.title || "Đội Ngũ Lãnh Đạo"}
                </h2>
                <p className="text-muted-foreground">
                  Những người đứng sau thành công của GlowSkin
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.map((member, index) => (
                  <Card key={index} className="border-0 shadow-sm overflow-hidden group">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="pt-4 text-center">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-primary text-sm font-medium">{member.role}</p>
                      <p className="text-muted-foreground text-sm mt-2">{member.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        <section className="py-10 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                  Tại Sao Chọn GlowSkin?
                </h2>
                <div className="space-y-4">
                  {[
                    "Hơn 500 sản phẩm từ 50+ thương hiệu quốc tế",
                    "Đội ngũ tư vấn chuyên nghiệp, nhiệt tình",
                    "Chính sách đổi trả linh hoạt trong 30 ngày",
                    "Giao hàng nhanh toàn quốc, miễn phí từ 500K",
                    "Chương trình ưu đãi, tích điểm hấp dẫn",
                    "Bảo hành chính hãng, cam kết chất lượng",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href="/products">
                      Khám phá sản phẩm
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop"
                        alt="Sản phẩm GlowSkin"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                      <p className="text-3xl font-bold">50+</p>
                      <p className="text-sm opacity-90">Thương hiệu đối tác</p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="bg-secondary rounded-2xl p-6">
                      <p className="text-3xl font-bold text-secondary-foreground">8+</p>
                      <p className="text-sm text-secondary-foreground/80">Năm kinh nghiệm</p>
                    </div>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=500&fit=crop"
                        alt="Khách hàng GlowSkin"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hệ thống cửa hàng */}
        <ShopLocationsSection />

        {/* CTA */}
        <section className="relative py-10 lg:py-16 bg-gradient-to-br from-primary via-rose-400/90 to-primary-hover text-primary-foreground overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-rose-300/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-10 text-white/5 text-8xl font-serif pointer-events-none select-none hidden lg:block">✿</div>
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Sẵn Sàng Trải Nghiệm?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Tham gia cùng hàng nghìn khách hàng đã tin tưởng và yêu thích sản phẩm của GlowSkin
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/products">Mua sắm ngay</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/50 hover:bg-primary-foreground/10 text-primary-foreground">
                <Link href="/contact">Liên hệ chúng tôi</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
