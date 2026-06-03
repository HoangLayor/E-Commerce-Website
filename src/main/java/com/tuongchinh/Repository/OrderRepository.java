package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = { "items", "address" })
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    @EntityGraph(attributePaths = {
            "items",
            "address",
            "user",
            "user.cart",
            "items.variant",
            "items.variant.product"
    })
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId")
    long countByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user.id = :userId")
    java.math.BigDecimal sumTotalAmountByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    List<Order> findAllByOrderByOrderDateDesc();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"items", "items.variant", "user", "address"})
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.paymentMethod IN ('VNPAY', 'MOMO') AND o.status = 'UNPAID' AND o.orderStatus = 'PENDING' AND o.createdAt < :thresholdTime")
    List<Order> findAbandonedOnlineOrders(@org.springframework.data.repository.query.Param("thresholdTime") java.time.LocalDateTime thresholdTime);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"items", "items.variant", "user", "address"})
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.paymentMethod = 'COD' AND o.orderStatus = 'PENDING'")
    List<Order> findPendingCodOrders();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.orderStatus IN :statuses")
    long countByUserIdAndOrderStatusIn(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("statuses") List<String> statuses);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.createdAt > :since")
    long countByUserIdAndCreatedAtAfter(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.orderStatus = 'AI_CANCEL_SUGGESTED' ORDER BY o.createdAt DESC")
    List<Order> findAiSuggestedCancelOrders();
}
