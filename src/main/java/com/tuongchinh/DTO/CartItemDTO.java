package com.tuongchinh.DTO;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CartItemDTO {
    private Long id;
    private Integer quantity;

    // Thông tin variant
    private Long variantId;
    private String sku;
    private BigDecimal price;
    private BigDecimal discountPrice; // ← thêm
    private BigDecimal effectivePrice; // ← thêm
    private Integer discountPercent; // ← thêm
    private String variantImageUrl;

    // Thông tin product
    private Long productId;
    private String productName;
    private String brandName;
    private String thumbnail;
    private java.util.List<ProductResponse.AttributeValueResponse> attributeValues;

    // Tổng tiền của dòng này
    private BigDecimal subtotal;
}