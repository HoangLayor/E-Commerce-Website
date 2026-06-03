package com.tuongchinh.Entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SaleAdminResponse extends SalePublicResponse {
    private BigDecimal costPrice;
    private BigDecimal profit;
    private BigDecimal profitPercent;
    private String warningLevel;
    private String warningMessage;
}