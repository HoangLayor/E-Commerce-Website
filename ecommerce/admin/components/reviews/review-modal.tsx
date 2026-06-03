"use client";

import { useState } from "react";
import { Star, Loader2, X, MessageSquare, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createReview } from "@/lib/api";
import Image from "next/image";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: number;
  productName: string;
  productImage: string;
  variantName?: string;
  onSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  orderItemId,
  productName,
  productImage,
  variantName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (comment.trim().length < 5) {
      toast.error("Vui lòng viết nhận xét ít nhất 5 ký tự");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        orderItemId,
        rating,
        comment: comment.trim(),
      });
      toast.success("Cảm ơn bạn đã gửi đánh giá!");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gửi đánh giá thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-gradient-to-r from-primary to-rose-400 text-white">
          <div className="flex justify-between items-center mb-2">
             <DialogTitle className="text-xl font-serif">Đánh giá sản phẩm</DialogTitle>
             <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
             </Button>
          </div>
          <DialogDescription className="text-white/80">
            Chia sẻ trải nghiệm của bạn để giúp GlowSkin và những khách hàng khác nhé!
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
              <Image
                src={productImage || "/placeholder.svg"}
                alt={productName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-sm line-clamp-2 mb-1">{productName}</h4>
              {variantName && (
                <p className="text-xs text-muted-foreground bg-white/50 w-fit px-2 py-0.5 rounded-full border border-border/50">
                  Phân loại: {variantName}
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="text-center space-y-3">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Mức độ hài lòng của bạn?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform duration-200 active:scale-95 outline-none"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hover || rating)
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                        : "text-muted fill-muted hover:text-amber-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-amber-600">
              {rating === 5 ? "Rất hài lòng 😍" : 
               rating === 4 ? "Hài lòng 🙂" : 
               rating === 3 ? "Bình thường 😐" : 
               rating === 2 ? "Không hài lòng 🙁" : 
               "Rất tệ 😡"}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-bold flex items-center gap-2">
               <MessageSquare className="h-4 w-4 text-primary" />
               Nhận xét chi tiết
            </label>
            <Textarea
              id="comment"
              placeholder="Sản phẩm dùng rất tốt, giao hàng nhanh..."
              className="resize-none h-32 rounded-2xl focus-visible:ring-primary/20 border-border/50 bg-muted/20"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Đánh giá của bạn sẽ được hiển thị công khai trên trang sản phẩm.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-full flex-1">
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="rounded-full flex-1 bg-gradient-to-r from-primary to-rose-500 hover:from-primary-hover hover:to-rose-600 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
