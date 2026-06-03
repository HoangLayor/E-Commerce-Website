package com.tuongchinh.DTO;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductRequest {
    private String name;
    private String description;
    private Long categoryId;
    private Long brandId;
    private List<VariantRequest> variants;
    @Data
    public static class VariantRequest {
        private Long id;
        private String sku;
        private BigDecimal price;
        private BigDecimal discountPrice;
        private List<Long> attributeValueIds;
        private String imageUrl;
        private BigDecimal compareAtPrice;
        private BigDecimal costPrice;
        private Integer stock;
    }
}