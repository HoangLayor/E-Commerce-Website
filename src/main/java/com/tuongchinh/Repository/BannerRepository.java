package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannerRepository
        extends JpaRepository<Banner, Long> {
}
