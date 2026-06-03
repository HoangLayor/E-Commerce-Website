package com.tuongchinh.DTO;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String email;
    private String password;

    @Data
    public static class CheckoutRequest {

        private String receiverName;
        private String phone;
        private String shippingAddress;
        private String paymentMethod;

    }
}
