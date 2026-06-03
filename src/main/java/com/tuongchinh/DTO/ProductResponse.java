package com.tuongchinh.DTO;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDateTime;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private String thumbnail;
    private Double averageRating;
    private Integer totalReviews;
    private Integer totalSold;
    private List<String> images;
    private BigDecimal priceMin;
    private List<VariantResponse> variants;
    private LocalDateTime createdAt;

    @Data
    public static class VariantResponse {
        private Long id;
        private String sku;
        private BigDecimal price;
        private BigDecimal compareAtPrice;
        private BigDecimal costPrice;
        private Integer stock;
        private String imageUrl;
        private Boolean isActive;
        private BigDecimal discountPrice; // ← thêm
        private BigDecimal effectivePrice; // ← thêm
        private Integer discountPercent;
        // ← thêm
        private List<AttributeValueResponse> attributeValues;
    }

    @Data
    public static class AttributeValueResponse {
        private String name; // e.g. "Color"
        private String value; // e.g. "Red"
    }
}
