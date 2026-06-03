"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Loader2, MessageSquare, ShoppingBag, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchMyReviews, deleteReview, type ReviewResponse } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await fetchMyReviews();
      setReviews(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này? Điểm đánh giá của sản phẩm sẽ được cập nhật lại.")) return;
    
    setIsDeleting(reviewId);
    try {
      await deleteReview(reviewId);
      toast.success("Đã xóa đánh giá thành công");
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      toast.error("Xóa đánh giá thất bại");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
          <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
          Đánh giá của tôi
        </h1>
        <p className="text-muted-foreground mt-1 text-base">
          Xem lại và quản lý các nhận xét bạn đã chia sẻ về sản phẩm
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
          <p className="mt-4 text-muted-foreground font-medium animate-pulse">Đang tải đánh giá của bạn...</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden border-border/50 hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Product Info Side */}
                  <div className="md:w-1 whitespace-nowrap bg-muted/20 p-6 md:border-r border-border/50 flex flex-col items-center gap-4 min-w-[240px]">
                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-white shadow-sm border border-border/50 group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={review.variant?.imageUrl || "/placeholder.svg"}
                        alt={review.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="font-bold text-sm line-clamp-2 max-w-[200px]">{review.productName}</h4>
                      {review.variant?.attributeValues && review.variant.attributeValues.length > 0 && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {review.variant.attributeValues.map(av => av.value).join(" / ")}
                        </p>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-full h-8 text-xs gap-1.5 border-primary/20 hover:bg-primary hover:text-white transition-all">
                      <Link href={`/product/${review.productId}`}>
                        Xem sản phẩm
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>

                  {/* Review Content Side */}
                  <div className="flex-1 p-6 flex flex-col justify-between relative">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="relative">
                         <MessageSquare className="h-10 w-10 text-primary/5 absolute -left-2 -top-2" />
                         <p className="text-foreground/90 leading-relaxed italic relative z-10 pl-2">
                           "{review.comment}"
                         </p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end">
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10 rounded-full h-9 px-4 gap-2"
                        onClick={() => handleDelete(review.id)}
                        disabled={isDeleting === review.id}
                       >
                          {isDeleting === review.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Xóa đánh giá
                       </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-transparent py-24 text-center">
          <CardContent className="space-y-6">
            <div className="relative mx-auto w-24 h-24">
               <MessageSquare className="h-24 w-24 text-muted-foreground/20" />
               <Star className="h-10 w-10 text-muted-foreground/30 absolute bottom-0 right-0" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground/50">Bạn chưa có đánh giá nào</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Chia sẻ cảm nhận của bạn về các sản phẩm đã mua để nhận thêm điểm thưởng và giúp đỡ cộng đồng nhé!
              </p>
            </div>
            <Button asChild className="rounded-full px-8 shadow-lg shadow-primary/20">
              <Link href="/account/orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Đến đơn hàng của tôi
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
