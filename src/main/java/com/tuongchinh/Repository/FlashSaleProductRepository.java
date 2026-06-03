package com.tuongchinh.Repository;

import com.tuongchinh.Entity.FlashSaleProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleProductRepository extends JpaRepository<FlashSaleProduct, Long> {
    List<FlashSaleProduct> findByFlashSaleId(Long flashSaleId);
    List<FlashSaleProduct> findByVariantId(Long variantId);
    List<FlashSaleProduct> findByFlashSaleIdAndSoldQuantityLessThan(Long flashSaleId, Integer quantity);
    boolean existsByFlashSaleIdAndVariantId(
            Long flashSaleId,
            Long variantId
    );

    @Query("SELECT fsp FROM FlashSaleProduct fsp WHERE fsp.variant.id = :variantId AND fsp.flashSale.isActive = true AND CURRENT_TIMESTAMP BETWEEN fsp.flashSale.startTime AND fsp.flashSale.endTime")
    Optional<FlashSaleProduct> findActiveByVariantId(@Param("variantId") Long variantId);
}