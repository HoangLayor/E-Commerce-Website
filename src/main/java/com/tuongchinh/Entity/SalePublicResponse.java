package com.tuongchinh.Entity;

import com.tuongchinh.DTO.ProductResponse;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

// Public — không có costPrice, profit, warning
@Data
public class SalePublicResponse {
    private Long variantId;
    private String sku;
    private String imageUrl;
    private List<ProductResponse.AttributeValueResponse> attributeValues;
    private Long productId;
    private String productName;
    private String brandName;
    private String thumbnail;
    private BigDecimal originalPrice;
    private BigDecimal discountPrice;
    private BigDecimal effectivePrice;
    private Integer discountPercent;
}
