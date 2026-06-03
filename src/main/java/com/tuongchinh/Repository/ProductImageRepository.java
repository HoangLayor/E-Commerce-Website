package com.tuongchinh.Repository;

import com.tuongchinh.Entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    @Query("SELECT pi.url FROM ProductImage pi WHERE pi.product.id = :productId ORDER BY pi.id")
    List<String> findUrlsByProductId(@Param("productId") Long productId);
}