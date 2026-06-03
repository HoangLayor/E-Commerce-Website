package com.tuongchinh.Controller;

import com.tuongchinh.DTO.WebhookOrderDTO;
import com.tuongchinh.Service.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;

    @PostMapping("/trigger-webhook")
    public ResponseEntity<?> triggerWebhook(@RequestBody List<WebhookOrderDTO> orders) {
        if (orders == null || orders.isEmpty()) {
            return ResponseEntity.badRequest().body("Order validation failed: Input list cannot be empty");
        }

        // Validate required fields (at least order_id)
        for (WebhookOrderDTO order : orders) {
            if (order.getOrder_id() == null || order.getOrder_id().isEmpty()) {
                return ResponseEntity.badRequest().body("Order validation failed: order_id is missing");
            }
        }

        try {
            // Processing webhook synchronously since the task specifies retry logic and try/catch.
            webhookService.triggerWebhookForOrders(orders);
            return ResponseEntity.ok("Webhook triggered successfully for " + orders.size() + " orders.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error triggering webhook: " + e.getMessage());
        }
    }
}
