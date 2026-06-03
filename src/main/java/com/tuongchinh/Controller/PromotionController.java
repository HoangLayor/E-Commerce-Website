package com.tuongchinh.Controller;

import com.tuongchinh.DTO.PromotionRequest;
import com.tuongchinh.DTO.PromotionResponse;
import com.tuongchinh.Entity.User;
import com.tuongchinh.Service.JwtService;
import com.tuongchinh.Service.PromotionService;
import com.tuongchinh.Service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin
public class PromotionController {

    private final PromotionService promotionService;
    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping("/public/promotions")
    public List<PromotionResponse> getActivePromotions(HttpServletRequest request) {
        User user = null;
        try {
            String token = userService.extractToken(request);
            if (token != null) {
                Long userId = jwtService.extractUserId(token);
                user = userService.findById(userId);
            }
        } catch (Exception ignored) {
        }

        return promotionService.getActivePromotions(user);
    }

    @PostMapping("/user/promotions/collect/{id}")
    public ResponseEntity<PromotionResponse> collectPromotion(
            @PathVariable("id") Long id, HttpServletRequest request) {
        User user = getCurrentUser(request);
        return ResponseEntity.ok(promotionService.collectPromotion(id, user));
    }

    @GetMapping("/user/my-promotions")
    public List<PromotionResponse> getMyPromotions(HttpServletRequest request) {
        User user = getCurrentUser(request);
        return promotionService.getMyPromotions(user);
    }

    // Admin endpoints
    @GetMapping("/admin/promotions")
    public List<PromotionResponse> getAllPromotions() {
        return promotionService.getAllPromotions();
    }

    @PostMapping("/admin/promotions")
    public PromotionResponse createPromotion(@RequestBody PromotionRequest request) {
        return promotionService.createPromotion(request);
    }

    @PutMapping("/admin/promotions/{id}")
    public PromotionResponse updatePromotion(@PathVariable("id") Long id, @RequestBody PromotionRequest request) {
        return promotionService.updatePromotion(id, request);
    }

    @DeleteMapping("/admin/promotions/{id}")
    public void deletePromotion(@PathVariable("id") Long id) {
        promotionService.deletePromotion(id);
    }

    private User getCurrentUser(HttpServletRequest request) {
        String token = userService.extractToken(request);
        if (token == null)
            throw new RuntimeException("Unauthorized");
        Long userId = jwtService.extractUserId(token);
        User user = userService.findById(userId);
        if (user == null)
            throw new RuntimeException("User not found");
        return user;
    }
}
