package com.tuongchinh.DTO;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// Tạo OrderResponse DTO
@Data
public class OrderResponse {
    private Long id;
    private String orderStatus;
    private String paymentStatus;
    private BigDecimal totalPrice;
    private String shippingAddress;
    private String receiverName;
    private String phone;
    private String paymentMethod;
    private LocalDateTime orderDate;
    private String voucherCode;
    private BigDecimal discountAmount;
    private String paymentUrl;
    private String cancelReason;
    private Boolean isRefundRequested;
    private String refundReason;
    private String refundAccountInfo;
    private String refundAttachmentUrl;
    private List<OrderItemDTO> items;
}
