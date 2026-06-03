package com.tuongchinh.DTO;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderItemDTO {
    private Long id;
    private Integer quantity;
    private BigDecimal price;
    private Long variantId;
    private Long productId;
    private String sku;
    private String productName;
    private String variantName;
    private String imageUrl;
    // Thuộc tính biến thể: [{name:"Màu", value:"Đỏ"}, ...]
    private List<ProductResponse.AttributeValueResponse> attributeValues;
    private Boolean isRestocked;
}
