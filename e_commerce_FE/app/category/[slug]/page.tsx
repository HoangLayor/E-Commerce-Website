import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductsContent } from "@/components/products/products-content";
import { Badge } from "@/components/ui/badge";
import { fetchStorefrontData } from "@/lib/api";
import { ChevronRight } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await fetchStorefrontData();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return { title: "Không tìm thấy danh mục" };
  }

  return {
    title: `${category.name} | GlowSkin - Mỹ Phẩm Chính Hãng`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { categories } = await fetchStorefrontData();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Get related categories (excluding current)
  const relatedCategories = categories.filter((c) => c.id !== category.id).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-background via-primary-light/10 to-secondary/10 py-4">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                Sản phẩm
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <section className="relative py-12 lg:py-16 overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-light/50 to-secondary/30"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-none">
                  {category.productCount} sản phẩm
                </Badge>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  {category.name}
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  {category.description}. Khám phá các sản phẩm chất lượng từ các thương hiệu hàng đầu thế giới.
                </p>
              </div>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl hidden lg:block border border-white/20">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid with Filter & Pagination */}
        <ProductsContent initialCategoryId={category.id} showBreadcrumb={false} />

        {/* Other Categories */}
        <section className="py-20 bg-secondary/5">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold mb-12 text-center">
              Khám Phá Danh Mục Khác
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <Image
                    src={cat.image || "/placeholder.svg"}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white transform group-hover:translate-y-[-4px] transition-transform">
                    <h3 className="font-bold text-xl mb-1">{cat.name}</h3>
                    <p className="text-sm text-white/80">{cat.productCount} sản phẩm</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
