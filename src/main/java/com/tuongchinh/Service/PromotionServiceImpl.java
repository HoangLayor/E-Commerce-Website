package com.tuongchinh.Service;

import com.tuongchinh.DTO.PromotionRequest;
import com.tuongchinh.DTO.PromotionResponse;
import com.tuongchinh.Entity.Promotion;
import com.tuongchinh.Entity.User;
import com.tuongchinh.Entity.UserPromotion;
import com.tuongchinh.Repository.PromotionRepository;
import com.tuongchinh.Repository.UserPromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final UserPromotionRepository userPromotionRepository;

    @Override
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PromotionResponse> getActivePromotions(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> activePromotions = promotionRepository.findByIsActiveTrueAndStartDateBeforeAndEndDateAfter(now, now);
        
        Map<Long, UserPromotion> collectedMap = null;
        if (user != null) {
            collectedMap = userPromotionRepository.findByUser(user).stream()
                    .collect(Collectors.toMap(up -> up.getPromotion().getId(), up -> up));
        }

        final Map<Long, UserPromotion> finalCollectedMap = collectedMap;
        return activePromotions.stream()
                .map(p -> {
                    PromotionResponse resp = mapToResponse(p);
                    if (finalCollectedMap != null && finalCollectedMap.containsKey(p.getId())) {
                        resp.setIsCollected(true);
                        resp.setIsUsed(finalCollectedMap.get(p.getId()).getIsUsed());
                    } else {
                        resp.setIsCollected(false);
                        resp.setIsUsed(false);
                    }
                    return resp;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PromotionResponse collectPromotion(Long promotionId, User user) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương trình khuyến mãi"));

        if (!promotion.getIsActive()) {
            throw new RuntimeException("Chương trình khuyến mãi này đã kết thúc");
        }

        if (promotion.getUsageLimit() != null && promotion.getUsageCount() >= promotion.getUsageLimit()) {
            throw new RuntimeException("Chương trình khuyến mãi này đã hết lượt sử dụng");
        }

        userPromotionRepository.findByUserAndPromotion(user, promotion)
                .ifPresent(up -> { throw new RuntimeException("Bạn đã thu thập mã này rồi"); });

        UserPromotion userPromotion = UserPromotion.builder()
                .user(user)
                .promotion(promotion)
                .build();

        userPromotionRepository.save(userPromotion);
        
        PromotionResponse resp = mapToResponse(promotion);
        resp.setIsCollected(true);
        resp.setIsUsed(false);
        return resp;
    }

    @Override
    public List<PromotionResponse> getMyPromotions(User user) {
        return userPromotionRepository.findByUser(user).stream()
                .map(up -> {
                    PromotionResponse resp = mapToResponse(up.getPromotion());
                    resp.setIsCollected(true);
                    resp.setIsUsed(up.getIsUsed());
                    return resp;
                })
                .collect(Collectors.toList());
    }

    @Override
    public PromotionResponse createPromotion(PromotionRequest request) {
        Promotion promotion = Promotion.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .type(request.getType())
                .value(request.getValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .usageLimit(request.getUsageLimit())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        
        return mapToResponse(promotionRepository.save(promotion));
    }

    @Override
    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương trình khuyến mãi"));
        
        promotion.setCode(request.getCode());
        promotion.setDescription(request.getDescription());
        promotion.setType(request.getType());
        promotion.setValue(request.getValue());
        promotion.setMinOrderAmount(request.getMinOrderAmount());
        promotion.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) promotion.setIsActive(request.getIsActive());
        
        return mapToResponse(promotionRepository.save(promotion));
    }

    @Override
    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        PromotionResponse resp = new PromotionResponse();
        resp.setId(promotion.getId());
        resp.setCode(promotion.getCode());
        resp.setDescription(promotion.getDescription());
        resp.setType(promotion.getType());
        resp.setValue(promotion.getValue());
        resp.setMinOrderAmount(promotion.getMinOrderAmount());
        resp.setMaxDiscountAmount(promotion.getMaxDiscountAmount());
        resp.setStartDate(promotion.getStartDate());
        resp.setEndDate(promotion.getEndDate());
        resp.setUsageLimit(promotion.getUsageLimit());
        resp.setUsageCount(promotion.getUsageCount());
        resp.setIsActive(promotion.getIsActive());
        return resp;
    }
    public void checkTestCase(PromotionRequest request) {

        if (request == null) {
            throw new RuntimeException("Request không được null");
        }

        // code
        if (request.getCode() == null
                || request.getCode().trim().isEmpty()) {

            throw new RuntimeException("Mã giảm giá không được để trống");
        }

        if (request.getCode().length() > 50) {
            throw new RuntimeException("Mã giảm giá quá dài");
        }

        // type
        List<String> validTypes =
                List.of("PERCENTAGE", "FIXED", "SHIPPING");

        if (!validTypes.contains(request.getType())) {
            throw new RuntimeException("Loại khuyến mãi không hợp lệ");
        }

        // value
        if (request.getValue() == null
                || request.getValue() <= 0) {

            throw new RuntimeException("Giá trị giảm phải lớn hơn 0");
        }

        // percentage
        if ("PERCENTAGE".equals(request.getType())
                && request.getValue() > 100) {

            throw new RuntimeException("Phần trăm giảm không được vượt quá 100%");
        }

        // minOrderAmount
        if (request.getMinOrderAmount() != null
                && request.getMinOrderAmount() < 0) {

            throw new RuntimeException("Giá trị đơn hàng tối thiểu không hợp lệ");
        }

        // maxDiscountAmount
        if (request.getMaxDiscountAmount() != null
                && request.getMaxDiscountAmount() < 0) {

            throw new RuntimeException("Giảm tối đa không hợp lệ");
        }

        // start/end date
        if (request.getStartDate() == null
                || request.getEndDate() == null) {

            throw new RuntimeException("Ngày bắt đầu và kết thúc không được để trống");
        }

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        // usageLimit
        if (request.getUsageLimit() != null
                && request.getUsageLimit() <= 0) {

            throw new RuntimeException("Số lượng sử dụng không hợp lệ");
        }
    }
}
