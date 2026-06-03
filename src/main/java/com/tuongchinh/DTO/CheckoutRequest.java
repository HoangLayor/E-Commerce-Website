package com.tuongchinh.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CheckoutRequest {
    private List<Long> cartItemIds;
    private Long addressId;
    private String paymentMethod;
    private String voucherCode;
    private java.math.BigDecimal shippingFee;
}