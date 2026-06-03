package com.tuongchinh.Repository;
import com.tuongchinh.Entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {

    // Lấy Flash Sale đang diễn ra (ACTIVE theo thời gian)
    List<FlashSale> findByStartTimeBeforeAndEndTimeAfter(LocalDateTime now1, LocalDateTime now2);

    // Lấy Flash Sale sắp diễn ra
    List<FlashSale> findByStartTimeAfter(LocalDateTime now);

    // Lấy Flash Sale đã kết thúc
    List<FlashSale> findByEndTimeBefore(LocalDateTime now);
    List<FlashSale> findByIsActiveTrue();
}
