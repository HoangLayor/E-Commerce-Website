import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartContent } from "@/components/cart/cart-content";

export const metadata = {
  title: "Giỏ hàng | GlowSkin",
  description: "Xem và quản lý giỏ hàng của bạn",
};

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CartContent />
      </main>
      <Footer />
    </div>
  );
}
