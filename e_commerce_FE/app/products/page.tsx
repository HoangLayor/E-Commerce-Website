import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductsContent } from "@/components/products/products-content";

export const metadata = {
  title: "Tất cả sản phẩm | GlowSkin",
  description: "Khám phá bộ sưu tập mỹ phẩm đa dạng từ GlowSkin. Sản phẩm chính hãng, giá tốt, giao hàng toàn quốc.",
};

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ProductsContent />
      </main>
      <Footer />
    </div>
  );
}
