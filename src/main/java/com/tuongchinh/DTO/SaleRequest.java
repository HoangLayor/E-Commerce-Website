package com.tuongchinh.DTO;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SaleRequest {
    private Long variantId;
    private BigDecimal discountPrice; // null = bỏ sale
}
