package com.tuongchinh.Repository;

import com.tuongchinh.Entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductId(Long productId);

    List<ProductVariant> findByProductIdAndIsActiveTrue(Long productId);
    Optional<ProductVariant> findBySku(String sku);
    // Lấy tất cả variant đang sale
    @Query("""
        SELECT pv FROM ProductVariant pv
        JOIN FETCH pv.product p
        JOIN FETCH p.brand
        JOIN FETCH p.category
        WHERE pv.isActive = true
        AND pv.discountPrice IS NOT NULL
        AND pv.discountPrice < pv.price
        ORDER BY (pv.price - pv.discountPrice) DESC
        """)
    List<ProductVariant> findSaleVariants();
}