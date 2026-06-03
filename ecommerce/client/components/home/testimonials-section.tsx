import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials as defaultTestimonials } from "@/lib/data";

type TestimonialItem = {
  id?: string;
  name: string;
  avatar?: string;
  rating?: number;
  content: string;
  product?: string;
};

type TestimonialsSectionProps = {
  title?: string;
  description?: string;
  testimonials?: TestimonialItem[];
};

export function TestimonialsSection({
  title = "Khách hàng nói gì về chúng tôi",
  description = "Những đánh giá thực tế từ khách hàng đã mua sắm tại cửa hàng.",
  testimonials,
}: TestimonialsSectionProps) {
  const items = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className="relative py-10 lg:py-16 bg-gradient-to-b from-primary-light/15 via-background to-secondary/10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
      <div className="absolute -top-8 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 right-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((testimonial, index) => {
            const rating = Math.min(5, Math.max(1, Number(testimonial.rating || 5)));

            return (
              <Card key={testimonial.id || `${testimonial.name}-${index}`} className="bg-white/70 backdrop-blur-sm border border-primary/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />

                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-3">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      {testimonial.product && (
                        <p className="text-sm text-muted-foreground">{testimonial.product}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
