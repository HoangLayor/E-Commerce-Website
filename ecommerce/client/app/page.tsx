import { FloatingBannerSection } from "@/components/home/floating-banner-section";
import { DynamicPage } from "@/components/dynamic/DynamicPage";
import { Header } from "@/components/layout/header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Render toàn bộ cấu trúc trang chủ động lưu trong Database */}
        <DynamicPage slug="home" showHeader={false} />
      </main>
      <FloatingBannerSection />
    </div>
  );
}
