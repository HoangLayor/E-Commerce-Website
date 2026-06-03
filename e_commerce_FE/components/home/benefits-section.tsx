import { Leaf, Award, Heart, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Award,
    title: "100% Chính Hãng",
    description: "Tất cả sản phẩm đều được nhập khẩu trực tiếp từ các thương hiệu, đảm bảo nguồn gốc rõ ràng và chất lượng đáng tin cậy.",
  },
  {
    icon: Leaf,
    title: "Thành Phần Tự Nhiên",
    description: "Chúng tôi ưu tiên các sản phẩm với thành phần tự nhiên, an toàn cho da và thân thiện với môi trường.",
  },
  {
    icon: Heart,
    title: "Tư Vấn Chuyên Gia",
    description: "Đội ngũ chuyên gia làm đẹp sẵn sàng tư vấn giúp bạn chọn sản phẩm phù hợp với loại da và nhu cầu.",
  },
  {
    icon: Sparkles,
    title: "Kết Quả Tức Thì",
    description: "Các sản phẩm được tuyển chọn kỹ lưỡng, mang lại hiệu quả thật sự cho làn da của bạn.",
  },
];

export function BenefitsSection() {
  return (
    <section className="relative py-10 lg:py-16 bg-gradient-to-br from-primary-light/40 via-rose-50/60 to-secondary/30 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-10 right-10 w-24 h-24 bg-primary/8 rounded-full blur-2xl" />
      <div className="absolute bottom-10 left-10 w-36 h-36 bg-secondary/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-200/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Tại Sao Chọn GlowSkin?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến cho bạn những sản phẩm tốt nhất với dịch vụ chăm sóc khách hàng xuất sắc.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-primary/5"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <benefit.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
