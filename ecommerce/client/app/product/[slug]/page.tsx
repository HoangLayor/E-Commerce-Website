import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductDetail } from "@/components/product/product-detail";
import { fetchProductById, fetchProductsByCategoryId } from "@/lib/api";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Helper to extract ID from slug (slug-format-123)
function getIdFromSlug(slug: string): number | null {
  if (!slug) return null;
  const parts = slug.split("-");
  const idStr = parts[parts.length - 1];
  const id = parseInt(idStr, 10);
  return isNaN(id) ? null : id;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const id = getIdFromSlug(slug);
  
  if (!id || id <= 0) {
    return {
      title: "Sản phẩm không tồn tại | GlowSkin",
    };
  }
  
  try {
    const product = await fetchProductById(id);
    return {
      title: `${product.name} | GlowSkin`,
      description: product.shortDescription,
      openGraph: {
        title: product.name,
        description: product.shortDescription,
        images: [product.images[0]?.url],
      },
    };
  } catch (error) {
    return {
      title: "Sản phẩm không tồn tại | GlowSkin",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const id = getIdFromSlug(slug);

  if (!id || id <= 0) {
    notFound();
  }

  try {
    const product = await fetchProductById(id);
    if (!product) notFound();

    // Get related products from same category
    const relatedProducts = await fetchProductsByCategoryId(Number(product.categoryId));
    const filteredRelated = relatedProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 4);

    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <ProductDetail product={product} relatedProducts={filteredRelated} />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error loading product:", error);
    notFound();
  }
}
