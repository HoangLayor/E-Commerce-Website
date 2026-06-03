package com.tuongchinh.Enum;

public enum PaymentStatus {
    UNPAID,    // COD chưa trả tiền
    PENDING,   // đang chờ thanh toán (VNPAY, MOMO)
    PAID,      // đã thanh toán
    FAILED,    // thanh toán thất bại
    REFUNDED   // đã hoàn tiền
}