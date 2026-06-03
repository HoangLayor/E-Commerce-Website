import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckoutContent } from "@/components/checkout/checkout-content";

export const metadata = {
  title: "Thanh toán | GlowSkin",
  description: "Hoàn tất đơn hàng của bạn",
};

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-background via-primary-light/10 to-secondary/8">
        <CheckoutContent />
      </main>
      <Footer />
    </div>
  );
}
