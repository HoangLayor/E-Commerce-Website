package com.tuongchinh.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Data
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Order order;
    private BigDecimal amount;
    private String method; // COD, VNPAY
    private String status; // PENDING, SUCCESS, FAILED
    private String transactionId;
}
