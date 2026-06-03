package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
    Optional<Payment> findTopByOrderIdOrderByIdDesc(Long orderId);
    Optional<Payment> findByTransactionId(String transactionId);
}