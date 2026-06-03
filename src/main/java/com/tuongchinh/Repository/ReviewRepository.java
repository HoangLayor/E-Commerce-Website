package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByOrderItemId(Long orderItemId);

    List<Review> findByProductId(Long productId);
    Page<Review> findByProduct_Id(Long productId, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "product", "orderItem", "orderItem.variant", "orderItem.variant.attributeValues", "orderItem.variant.attributeValues.attribute"})
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
}
