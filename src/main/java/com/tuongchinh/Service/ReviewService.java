package com.tuongchinh.Service;

import com.tuongchinh.DTO.ReviewListResponse;
import com.tuongchinh.DTO.ReviewRequest;
import com.tuongchinh.DTO.ReviewResponse;
import com.tuongchinh.Entity.OrderItem;
import com.tuongchinh.Entity.Product;
import com.tuongchinh.Entity.ProductVariant;
import com.tuongchinh.Entity.Review;
import com.tuongchinh.Repository.OrderItemRepository;
import com.tuongchinh.Repository.OrderRepository;
import com.tuongchinh.Repository.ProductVariantRepository;
import com.tuongchinh.Repository.ReviewRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class ReviewService {

    private OrderRepository orderRepository;
    private OrderItemRepository orderItemRepository;
    private ReviewRepository reviewRepository;
    private ProductVariantRepository productVariantRepository;

    public ReviewService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, ReviewRepository reviewRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository=orderItemRepository;
        this.reviewRepository=reviewRepository;
    }

    @Transactional
    public void createReview(Long userId, ReviewRequest req) {
        OrderItem item = orderItemRepository.findById(req.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy order item"));
        if (!item.getOrder().getUser().getId().equals(userId)) {
            throw new RuntimeException("Không phải đơn của bạn");
        }

        // 2. đã giao hàng
        if (!item.getOrder().getOrderStatus().equals("DELIVERED")) {
            throw new RuntimeException("Chưa thể đánh giá");
        }

        // 3. chưa review
        if (reviewRepository.existsByOrderItemId(item.getId())) {
            throw new RuntimeException("Đã đánh giá rồi");
        }

        // 4. tạo review
        Review review = new Review();
        review.setRating(req.getRating());
        review.setComment(req.getComment());
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        review.setUser(item.getOrder().getUser());
        review.setProduct(item.getVariant().getProduct());
        review.setOrderItem(item);
        Product product=review.getOrderItem().getVariant().getProduct();
        int oldTotal = (product.getTotalReviews() != null) ? product.getTotalReviews() : 0;
        double oldAvg = (product.getAverageRating() != null) ? product.getAverageRating() : 0.0;
        int newRating = review.getRating();
        double newAvg = (oldAvg * oldTotal + newRating) / (oldTotal + 1);
        product.setAverageRating(newAvg);
        product.setTotalReviews(oldTotal + 1);
        reviewRepository.save(review);

    }
    public ReviewListResponse getReviewsByProduct(Long productId, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Review> reviewPage =
                reviewRepository.findByProduct_Id(productId, pageable);

        List<ReviewResponse> reviewResponses = reviewPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .toList();
        ReviewListResponse res = new ReviewListResponse();
        res.setTotalReviews((int) reviewPage.getTotalElements());

        res.setCurrentPage(reviewPage.getNumber());
        res.setTotalPages(reviewPage.getTotalPages());
        res.setPageSize(reviewPage.getSize());

        res.setReviews(reviewResponses);

        return res;
    }
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ReviewResponse mapToResponse(Review review) {
        ReviewResponse res = new ReviewResponse();
        res.setId(review.getId());
        
        if (review.getProduct() != null) {
            res.setProductId(review.getProduct().getId());
            res.setProductName(review.getProduct().getName());
        }
        
        if (review.getUser() != null) {
            res.setUsername(review.getUser().getName());
        }
        
        res.setRating(review.getRating());
        res.setComment(review.getComment());
        res.setCreatedAt(review.getCreatedAt());

        if (review.getOrderItem() != null && review.getOrderItem().getVariant() != null) {
            ProductVariant variant = review.getOrderItem().getVariant();
            ReviewResponse.VariantInfo v = new ReviewResponse.VariantInfo();
            v.setId(variant.getId());
            v.setSku(variant.getSku());
            v.setImageUrl(variant.getImageUrl());
            
            if (variant.getAttributeValues() != null) {
                List<ReviewResponse.AttributeValueResponse> attrs =
                        variant.getAttributeValues().stream().map(av -> {
                            ReviewResponse.AttributeValueResponse dto =
                                    new ReviewResponse.AttributeValueResponse();
                            if (av.getAttribute() != null) {
                                dto.setName(av.getAttribute().getName());
                            }
                            dto.setValue(av.getValue());
                            return dto;
                        }).toList();
                v.setAttributeValues(attrs);
            }
            res.setVariant(v);
        }

        return res;
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not your review to delete");
        }

        Product product = review.getProduct();
        int oldTotal = (product.getTotalReviews() != null) ? product.getTotalReviews() : 0;
        double oldAvg = (product.getAverageRating() != null) ? product.getAverageRating() : 0.0;
        int ratingToDelete = review.getRating();

        if (oldTotal > 1) {
            double newAvg = (oldAvg * oldTotal - ratingToDelete) / (oldTotal - 1);
            product.setAverageRating(newAvg);
            product.setTotalReviews(oldTotal - 1);
        } else {
            product.setAverageRating(0.0);
            product.setTotalReviews(0);
        }

        reviewRepository.delete(review);
    }
}
