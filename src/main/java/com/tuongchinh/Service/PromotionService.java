package com.tuongchinh.Service;

import com.tuongchinh.DTO.PromotionRequest;
import com.tuongchinh.DTO.PromotionResponse;
import com.tuongchinh.Entity.User;

import java.util.List;

public interface PromotionService {
    List<PromotionResponse> getAllPromotions();
    List<PromotionResponse> getActivePromotions(User user);
    PromotionResponse collectPromotion(Long promotionId, User user);
    List<PromotionResponse> getMyPromotions(User user);
    
    // Admin
    PromotionResponse createPromotion(PromotionRequest request);
    PromotionResponse updatePromotion(Long id, PromotionRequest request);
    void deletePromotion(Long id);
    void checkTestCase(PromotionRequest request);
}
