// VoucherApplyResponse.java
package com.tuongchinh.DTO;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class VoucherApplyResponse {
    private String code;
    private String type;
    private BigDecimal discountAmount;  // số tiền được giảm
    private BigDecimal finalAmount;     // tổng tiền sau giảm
    private String message;
}