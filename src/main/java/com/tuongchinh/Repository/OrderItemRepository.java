package com.tuongchinh.Repository;

import com.tuongchinh.DTO.BestSellingProductDTO;
import com.tuongchinh.Entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
//    @Query("""
//        SELECT new com.tuongchinh.DTO.BestSellingProductDTO(
//            p.id,
//            p.name,
//            SUM(oi.quantity)
//        )
//        FROM OrderItem oi
//        JOIN oi.product p
//        JOIN oi.order o
//        WHERE o.orderStatus = 'COMPLETED'
//        GROUP BY p.id, p.name
//        ORDER BY SUM(oi.quantity) DESC
//    """)
//    List<BestSellingProductDTO> findBestSellingProducts(Pageable pageable);
}
