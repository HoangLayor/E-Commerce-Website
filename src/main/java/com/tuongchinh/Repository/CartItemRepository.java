package com.tuongchinh.Repository;

import com.tuongchinh.Entity.CartItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);
    void deleteByCartId(Long cartId);

    @EntityGraph(attributePaths = {"variant", "variant.product", "cart"})
    List<CartItem> findByCartId(Long cartID);

    @EntityGraph(attributePaths = {"variant", "variant.product", "cart"})
    List<CartItem> findAllByIdIn(List<Long> ids);

    void deleteByCartUserIdAndVariantIdIn(Long userId, List<Long> variantIds);
}
