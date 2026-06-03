package com.tuongchinh.DTO;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PromotionResponse {
    private Long id;
    private String code;
    private String description;
    private String type;
    private Double value;
    private Double minOrderAmount;
    private Double maxDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usageCount;
    private Boolean isActive;
    
    // For user-specific view
    private Boolean isCollected;
    private Boolean isUsed;
}
