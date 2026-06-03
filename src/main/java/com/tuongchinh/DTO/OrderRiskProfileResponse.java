package com.tuongchinh.DTO;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderRiskProfileResponse {
    // User History
    private long accountAgeDays;
    private long totalSuccessfulOrders;
    private long totalCancelledOrders;
    private long totalFailedDeliveries;
    private long ordersInLast24h;

    // Order Details
    private BigDecimal totalAmount;
    private String paymentMethod;
    private LocalDateTime orderTime;
    private String voucherCode;

    // Shipping Info
    private String receiverName;
    private String phone;
    private String shippingAddress;

    // Items
    private List<OrderItemDTO> items;
}
