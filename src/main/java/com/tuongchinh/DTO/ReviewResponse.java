package com.tuongchinh.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReviewResponse {

    private Long id;

    private String username;
    private Long productId;
    private String productName;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private VariantInfo variant;

    @Data
    public static class VariantInfo {
        private Long id;
        private String sku;
        private String imageUrl;

        private List<AttributeValueResponse> attributeValues;
    }

    @Data
    public static class AttributeValueResponse {
        private String name;   // "Color"
        private String value;  // "Red"
    }
}