package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Banner;
import com.tuongchinh.Entity.BannerItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerItemRepository
        extends JpaRepository<BannerItem, Long> {

    List<BannerItem>
    findByBannerAndActiveTrueOrderByPositionAsc(
            Banner banner
    );
}
