package com.tuongchinh.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PromotionRequest {
    private String code;
    private String description;
    private String type; // PERCENTAGE, FIXED, SHIPPING
    private Double value;
    private Double minOrderAmount;
    private Double maxDiscountAmount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    private Integer usageLimit;
    private Boolean isActive;
}
