package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCode(String code);
    
    List<Promotion> findByIsActiveTrueAndStartDateBeforeAndEndDateAfter(
            LocalDateTime now1, LocalDateTime now2);
}
