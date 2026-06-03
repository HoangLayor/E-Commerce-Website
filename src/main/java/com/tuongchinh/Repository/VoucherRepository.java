package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCode(String code);

    // Lấy voucher còn hiệu lực
    List<Voucher> findByIsActiveTrueAndExpiryDateAfter(LocalDateTime now);
}