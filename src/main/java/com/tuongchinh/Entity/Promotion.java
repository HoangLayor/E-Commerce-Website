package com.tuongchinh.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Column(nullable = false)
    private String type; // PERCENTAGE, FIXED, SHIPPING

    @Column(nullable = false)
    private Double value;

    private Double minOrderAmount;

    private Double maxDiscountAmount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer usageLimit;

    @Builder.Default
    private Integer usageCount = 0;

    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
