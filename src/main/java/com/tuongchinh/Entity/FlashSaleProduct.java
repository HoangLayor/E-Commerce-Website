package com.tuongchinh.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
@Entity
@Table(name = "flash_sale_product")
@Data
public class FlashSaleProduct {
    @Id
    @GeneratedValue
    private Long id;
    @ManyToOne
    private FlashSale flashSale;
    @ManyToOne
    private ProductVariant variant;
    private BigDecimal salePrice;
    private Integer quantity;
    private Integer MaxUser;
    private Integer soldQuantity = 0;
}