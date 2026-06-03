"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { type Category } from "@/lib/data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import { fetchCategories } from "@/lib/api";

type CategoriesSectionProps = {
  title?: string;
  description?: string;
  categoryIds?: Array<string | number>;
  limit?: number | string | null;
  showProductCount?: boolean;
  showNavigation?: boolean;
  showDots?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number | string | null;
  onlyRootCategories?: boolean;
};

export function CategoriesSection({
  title = "Danh mục sản phẩm",
  description = "Khám phá các danh mục sản phẩm đang có trên website.",
  categoryIds = [],
  limit,
  showProductCount = true,
  showNavigation = true,
  showDots = true,
  autoplay = true,
  autoplayDelay = 3000,
  onlyRootCategories = false,
}: CategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const selectedCategoryIds = useMemo(
    () => new Set(categoryIds.map((id) => String(id)).filter(Boolean)),
    [categoryIds]
  );
  const parsedLimit = Number(limit);
  const categoryLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined;
  const parsedAutoplayDelay = Number(autoplayDelay);
  const safeAutoplayDelay =
    Number.isFinite(parsedAutoplayDelay) && parsedAutoplayDelay >= 500 ? parsedAutoplayDelay : 3000;

  const visibleCategories = useMemo(() => {
    let items = categories;

    if (onlyRootCategories) {
      items = items.filter((category) => !category.parentId);
    }

    if (selectedCategoryIds.size > 0) {
      items = items.filter((category) => selectedCategoryIds.has(category.id));
    }

    return categoryLimit ? items.slice(0, categoryLimit) : items;
  }, [categories, categoryLimit, onlyRootCategories, selectedCategoryIds]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((data) => { if (!cancelled) setCategories(data); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!api) return;
    const updateCarouselState = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };
    updateCarouselState();
    api.on("select", updateCarouselState);
    api.on("reInit", updateCarouselState);
    return () => {
      api.off("select", updateCarouselState);
      api.off("reInit", updateCarouselState);
    };
  }, [api, visibleCategories.length]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  return (
    <section className="relative py-10 lg:py-16 bg-gradient-to-b from-background via-secondary/10 to-primary-light/20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {/* Navigation Arrows */}
          {showNavigation && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-40"
              aria-label="Danh mục trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-40"
              aria-label="Danh mục sau"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          )}
        </div>

        {/* Categories Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={autoplay ? [
            Autoplay({ delay: safeAutoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true }),
          ] : []}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {visibleCategories.map((category, index) => (
              <CarouselItem
                key={category.id}
                className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted block"
                >
                  {/* Image */}
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority={index < 3}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <h3 className="font-medium text-white text-lg mb-1 group-hover:text-primary-light transition-colors">
                      {category.name}
                    </h3>
                    {showProductCount && (
                      <p className="text-white/80 text-sm flex items-center gap-1">
                        {category.productCount} sản phẩm
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </p>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots */}
        {showDots && count > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Chuyển đến nhóm ${index + 1}`}
            />
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
