package com.tuongchinh.Controller;

import com.tuongchinh.DTO.ReviewRequest;
import com.tuongchinh.DTO.ReviewResponse;
import com.tuongchinh.Service.JwtService;
import com.tuongchinh.Service.ReviewService;
import com.tuongchinh.Service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtService jwtService;
    private final UserService userService;

    // 🔥 1. Tạo review
    @PostMapping("/user/review")
    public ResponseEntity<?> createReview(
            @RequestBody ReviewRequest request,
            HttpServletRequest httpRequest) {

        String token = userService.extractToken(httpRequest);
        Long userId = jwtService.extractUserId(token);

        reviewService.createReview(userId, request);

        return ResponseEntity.ok("Đánh giá thành công");
    }

    @GetMapping("/public/review/{productId}")
    public ResponseEntity<?> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(
                reviewService.getReviewsByProduct(productId, page, size)
        );
    }

    // 🔥 3. Lấy review của user
    @GetMapping("/user/reviews/my")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(
            HttpServletRequest httpRequest) {

        String token = userService.extractToken(httpRequest);
        Long userId = jwtService.extractUserId(token);

        return ResponseEntity.ok(
                reviewService.getReviewsByUser(userId)
        );
    }

    // 🔥 4. (optional) Xóa review
    @DeleteMapping("/user/review/{id}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        String token = userService.extractToken(httpRequest);
        Long userId = jwtService.extractUserId(token);

        reviewService.deleteReview(id, userId);

        return ResponseEntity.ok("Xóa đánh giá thành công");
    }
}