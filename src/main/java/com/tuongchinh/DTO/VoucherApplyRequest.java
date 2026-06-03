// VoucherApplyRequest.java — User áp dụng voucher
package com.tuongchinh.DTO;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class VoucherApplyRequest {
    private String code;
    private BigDecimal orderAmount;
}
