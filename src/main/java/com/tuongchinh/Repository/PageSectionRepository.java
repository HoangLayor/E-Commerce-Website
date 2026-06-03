package com.tuongchinh.Repository;

import com.tuongchinh.Entity.PageSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tuongchinh.Entity.Page;
import java.util.List;

@Repository
public interface PageSectionRepository extends JpaRepository<PageSection, Long> {
    List<PageSection> findByPageIdAndActiveTrueOrderByPositionAsc(Long pageId);
    List<PageSection> findByPageAndActiveTrueOrderByPositionAsc(Page page);
    List<PageSection> findByPageIdOrderByPositionAsc(Long pageId);
}
