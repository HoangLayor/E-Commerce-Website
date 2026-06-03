package com.tuongchinh.DTO;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleResponse {

    // Thông tin variant
    private Long variantId;
    private String sku;
    private String imageUrl;

    // Thông tin sản phẩm
    private Long productId;
    private String productName;
    private String brandName;
    private BigDecimal costPrice;
    private BigDecimal originalPrice;
    private BigDecimal discountPrice;
    private Integer discountPercent;

    // Lợi nhuận (chỉ admin thấy)
    private BigDecimal profit;
    private BigDecimal profitPercent;

    // Thuộc tính biến thể (màu sắc, kích thước, ...)
    private List<ProductResponse.AttributeValueResponse> attributeValues;

    // Cảnh báo
    private String warningLevel;
    private String warningMessage;
}