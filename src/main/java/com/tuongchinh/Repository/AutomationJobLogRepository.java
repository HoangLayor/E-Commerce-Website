package com.tuongchinh.Repository;

import com.tuongchinh.Entity.AutomationJobLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AutomationJobLogRepository extends JpaRepository<AutomationJobLog, Long> {
    List<AutomationJobLog> findAllByOrderByStartTimeDesc();
}
