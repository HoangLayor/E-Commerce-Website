import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ThumbsUp, BadgeCheck, MessageSquare, Filter, Camera, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { fetchReviewsByProduct, type ReviewResponse, type ReviewListResponse } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface ProductReviewsProps {
  productId: number;
  averageRating?: number;
  totalReviews?: number;
}

export function ProductReviews({ productId, averageRating = 0, totalReviews = 0 }: ProductReviewsProps) {
  const [reviewsData, setReviewsData] = useState<ReviewListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function loadReviews() {
      setIsLoading(true);
      try {
        const data = await fetchReviewsByProduct(productId, page, 5);
        setReviewsData(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [productId, page]);

  // Mock distribution since backend doesn't provide it yet
  // In a real app, this would come from the API
  const distribution = [
    { stars: 5, count: Math.round(totalReviews * 0.70) },
    { stars: 4, count: Math.round(totalReviews * 0.15) },
    { stars: 3, count: Math.round(totalReviews * 0.08) },
    { stars: 2, count: Math.round(totalReviews * 0.04) },
    { stars: 1, count: Math.round(totalReviews * 0.03) },
  ];

  if (isLoading && !reviewsData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <Card className="border-2 border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground opacity-30" />
          </div>
          <p className="text-muted-foreground font-medium">Sản phẩm này hiện chưa có đánh giá nào.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Hãy là người đầu tiên trải nghiệm và để lại đánh giá bạn nhé!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Summary Dashboard */}
      <Card className="overflow-hidden border-none shadow-xl shadow-primary/5 bg-gradient-to-br from-white to-primary-light/10">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-primary/10">
            {/* Main Score */}
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Đánh giá trung bình</span>
              <div className="relative">
                <span className="text-6xl font-black text-primary">{averageRating.toFixed(1)}</span>
                <span className="text-xl font-bold text-muted-foreground/40 absolute -right-6 bottom-2">/5</span>
              </div>
              <div className="flex gap-1 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating) ? "fill-warning text-warning" : "text-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground pt-1">Dựa trên <span className="font-bold text-foreground">{totalReviews}</span> nhận xét</p>
            </div>

            {/* Distribution Bars */}
            <div className="p-8 md:col-span-2 space-y-3 flex flex-col justify-center">
              {distribution.map((item) => {
                const percentage = totalReviews > 0 ? (item.count / totalReviews) * 100 : 0;
                return (
                  <div key={item.stars} className="flex items-center gap-4 group">
                    <div className="flex items-center gap-1 w-12 flex-shrink-0">
                      <span className="text-sm font-bold">{item.stars}</span>
                      <Star className="h-3 w-3 fill-warning text-warning" />
                    </div>
                    <div className="flex-1 h-2 relative">
                      <Progress value={percentage} className="h-2 bg-muted/50" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-10 text-right group-hover:text-primary transition-colors">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="text-xs gap-2 px-4">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs gap-2 px-4">
              <Camera className="h-3 w-3" />
              Có hình ảnh
            </TabsTrigger>
            <TabsTrigger value="verified" className="text-xs gap-2 px-4">
              <BadgeCheck className="h-3 w-3" />
              Đã mua
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" />
            Sắp xếp theo:
            <select className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer">
              <option>Mới nhất</option>
              <option>Đánh giá cao nhất</option>
              <option>Đánh giá thấp nhất</option>
            </select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-6 mt-0">
          <div className="grid gap-6">
            {reviewsData.reviews.map((review) => (
              <div key={review.id} className="group relative">
                <Card className="border-none shadow-sm group-hover:shadow-md transition-all bg-white/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {review.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm tracking-tight">{review.username}</span>
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none text-[9px] px-2 py-0 h-4 font-bold flex gap-1">
                                <BadgeCheck className="h-3 w-3" />
                                Đã mua hàng
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= review.rating ? "fill-warning text-warning" : "text-muted-foreground/20"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 rounded-full">
                                {format(new Date(review.createdAt), "dd MMM, yyyy", { locale: vi })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-muted-foreground">
                            <span className="font-medium opacity-60">Phân loại:</span>{" "}
                            <span className="font-bold text-foreground/70">
                              {review.variant.attributeValues && review.variant.attributeValues.length > 0 
                                ? review.variant.attributeValues.map(av => av.value).join(" / ")
                                : review.variant.sku}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-foreground/90 leading-relaxed mb-5 antialiased">
                          {review.comment}
                        </p>

                        {review.variant.imageUrl && (
                          <div className="mb-5 flex flex-wrap gap-2">
                            <div className="relative group/img w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-sm cursor-zoom-in hover:border-primary/30 transition-all">
                              <Image
                                src={review.variant.imageUrl}
                                alt="Review image"
                                fill
                                className="object-cover group-hover/img:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-muted/50 pt-4 mt-2">
                          <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary-light/10 rounded-full">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Hữu ích (0)
                          </Button>
                          <div className="flex items-center gap-3">
                            <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground underline underline-offset-4">Phản hồi</button>
                            <span className="text-[10px] text-muted-foreground opacity-30">|</span>
                            <button className="text-[10px] font-bold text-muted-foreground hover:text-destructive underline underline-offset-4">Báo cáo</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {reviewsData.totalPages > 1 && (
            <div className="pt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 0) setPage(page - 1);
                      }}
                      className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer rounded-full bg-white shadow-sm border-none"}
                    />
                  </PaginationItem>
                  {Array.from({ length: reviewsData.totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        isActive={page === i}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(i);
                        }}
                        className={`cursor-pointer rounded-full w-9 h-9 border-none shadow-sm ${page === i ? "bg-primary text-white shadow-primary/20" : "bg-white hover:bg-primary-light/20"}`}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < reviewsData.totalPages - 1) setPage(page + 1);
                      }}
                      className={page === reviewsData.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer rounded-full bg-white shadow-sm border-none"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
