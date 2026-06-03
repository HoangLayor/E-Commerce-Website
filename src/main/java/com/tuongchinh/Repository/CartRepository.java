package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Cart;
import com.tuongchinh.Entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

    @EntityGraph(attributePaths = {
            "items",
            "items.variant",
            "items.variant.product",
            "items.variant.product.brand",
            "items.variant.product.category",
            "items.variant.attributeValues",
            "items.variant.attributeValues.attribute"
    })
    Optional<Cart> findByUserId(Long userId);
}