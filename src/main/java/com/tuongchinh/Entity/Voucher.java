package com.tuongchinh.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "voucher")
@Data
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String type;            // PERCENT / FIXED / SHIPPING

    @Column(nullable = false)
    private BigDecimal value;       // 10 (10%) hoặc 50000 (50k)

    @Column(nullable = false)
    private BigDecimal minOrderValue;   // đơn tối thiểu

    private BigDecimal maxDiscount;     // giảm tối đa

    private LocalDateTime expiryDate;

    private Integer usageLimit;         // tổng lượt dùng

    private Integer usedCount = 0;      // đã dùng bao nhiêu lượt

    private Boolean isActive = true;

    // Kiểm tra voucher còn hiệu lực không
    public boolean isValid() {
        return Boolean.TRUE.equals(isActive)
                && (expiryDate == null || expiryDate.isAfter(LocalDateTime.now()))
                && (usageLimit == null || usedCount < usageLimit);
    }
}