package com.tuongchinh.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.BatchSize;

@Entity
@Table(name = "product_variant")
@Getter
@Setter
@BatchSize(size = 100)
public class ProductVariant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private BigDecimal compareAtPrice;
    private Integer stock;
    private String sku;
    private String imageUrl;
    private Boolean isActive = true;
    private Integer totalSold = 0;
    private boolean IsFlashSale;
    @Column(name = "cost_price")
    private BigDecimal costPrice;
    @ManyToMany
    @JoinTable(name = "variant_attribute_value", joinColumns = @JoinColumn(name = "variant_id"), inverseJoinColumns = @JoinColumn(name = "attribute_value_id"))
    @org.hibernate.annotations.BatchSize(size = 100)
    private List<AttributeValue> attributeValues = new ArrayList<>();
    public BigDecimal getEffectivePrice() {
        return discountPrice != null ? discountPrice : price;
    }
    public int getDiscountPercent() {
        if (discountPrice == null) return 0;
        return price.subtract(discountPrice)
                .multiply(BigDecimal.valueOf(100))
                .divide(price, 0, java.math.RoundingMode.HALF_UP)
                .intValue();
    }
    public BigDecimal getProfit() {
        if (costPrice == null) return null;
        return getEffectivePrice().subtract(costPrice);
    }

    public boolean isLoss() {
        if (costPrice == null) return false;
        return getEffectivePrice().compareTo(costPrice) < 0;
    }

    public BigDecimal getProfitPercent() {
        if (costPrice == null || costPrice.compareTo(BigDecimal.ZERO) == 0) return null;
        return getEffectivePrice().subtract(costPrice)
                .multiply(BigDecimal.valueOf(100))
                .divide(costPrice, 2, java.math.RoundingMode.HALF_UP);
    }
}