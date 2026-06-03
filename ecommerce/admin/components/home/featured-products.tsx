"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { type Product } from "@/lib/data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import { fetchBestSellers, fetchNewProducts, fetchProducts } from "@/lib/api";

interface FeaturedProductsProps {
  title: string;
  filter?: "bestseller" | "new" | "sale";
}

export function FeaturedProducts({ title, filter }: FeaturedProductsProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        let data: Product[] = [];

        if (filter === "bestseller") {
          data = await fetchBestSellers(8);
        } else if (filter === "new") {
          data = await fetchNewProducts(8);
        } else {
          data = await fetchProducts({ size: 8 });
        }

        if (isMounted) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();
    return () => { isMounted = false; };
  }, [filter]);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  if (isLoading) {
    return (
      <section className="py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">Đang tải sản phẩm...</p>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show empty sections
  }

  return (
    <section className={cn(
      "relative py-16 lg:py-24 overflow-hidden",
      filter === "bestseller" 
        ? "bg-gradient-to-br from-[#fdf6f7] via-[#fff5f5] to-[#fdf0f2]" 
        : "bg-gradient-to-b from-secondary/10 via-muted/20 to-background"
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      {filter === "bestseller" && (
        <>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[url('/patterns/top-dots.svg')] opacity-[0.03] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Section Marker */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
        </>
      )}

      {filter !== "bestseller" && (
        <>
          <div className="absolute -top-12 right-1/3 w-36 h-36 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 left-1/3 w-28 h-28 bg-secondary/10 rounded-full blur-3xl" />
        </>
      )}
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <h2 className={cn(
              "font-serif text-3xl md:text-5xl font-bold mb-4 tracking-tight capitalize",
              filter === "bestseller" ? "text-primary-dark" : "text-foreground"
            )}>
              {title}
            </h2>
            <div className={cn(
              "h-1 w-20 mb-4 rounded-full",
              filter === "bestseller" ? "bg-primary" : "bg-muted-foreground/30"
            )} />
            <p className="text-muted-foreground text-lg leading-relaxed italic">
              "Những sản phẩm được yêu thích nhất từ khách hàng của chúng tôi"
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                aria-label="Sản phẩm trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollNext}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                aria-label="Sản phẩm sau"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/products" className="flex items-center gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Products Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: products.length > 4, // Only loop if we have enough items
          }}
          plugins={[
            Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product, index) => (
              <CarouselItem
                key={product.id}
                className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <ProductCard
                  product={product}
                  priority={index < 2}
                  rank={filter === "bestseller" ? index + 1 : undefined}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots */}
        {count > 1 && (
          <div className="flex justify-center gap-1.5 mt-8">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Chuyển đến nhóm sản phẩm ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
