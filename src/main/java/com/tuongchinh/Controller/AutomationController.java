package com.tuongchinh.Controller;

import com.tuongchinh.Entity.AutomationJobLog;
import com.tuongchinh.Repository.AutomationJobLogRepository;
import com.tuongchinh.Service.OrderAutomationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/automation")
@RequiredArgsConstructor
public class AutomationController {

    private final OrderAutomationService automationService;
    private final AutomationJobLogRepository logRepository;

    @GetMapping("/logs")
    public ResponseEntity<List<AutomationJobLog>> getLogs() {
        return ResponseEntity.ok(logRepository.findAllByOrderByStartTimeDesc());
    }

    @PostMapping("/trigger")
    public ResponseEntity<?> triggerJob() {
        // Run asynchronously or synchronously. Since we want immediate feedback of completion, we run sync for now,
        // or we could just run it in a new thread and return "Job Started". Let's run it synchronously for simplicity.
        try {
            automationService.runAutomationFlow("MANUAL");
            return ResponseEntity.ok(Map.of("message", "Đã chạy luồng tự động thành công!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
