package com.tuongchinh.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tuongchinh.Entity.*;
import com.tuongchinh.Repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderAutomationService {

    private final OrderRepository orderRepository;
    private final AutomationJobLogRepository logRepository;
    private final ProductVariantRepository productVariantRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Scheduled(cron = "0 0 0 * * ?") // Chạy vào lúc 00:00 mỗi ngày (mỗi 24 tiếng)
    public void runScheduledJob() {
        runAutomationFlow("AUTO");
    }

    public void runAutomationFlow(String triggerType) {
        log.info("🤖 Bắt đầu chạy luồng tự động duyệt đơn hàng bằng AI. Hình thức kích hoạt: {}", triggerType);
        AutomationJobLog jobLog = new AutomationJobLog();
        jobLog.setJobName("Order Automation Flow");
        jobLog.setTriggerType(triggerType);
        jobLog.setStartTime(LocalDateTime.now());
        jobLog.setStatus("RUNNING");
        jobLog = logRepository.save(jobLog);

        List<String> executionDetails = new ArrayList<>();
        int processed = 0, cancelled = 0, confirmed = 0;

        try {
            // 1. Process Abandoned Online Orders
            LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
            List<Order> abandonedOrders = orderRepository.findAbandonedOnlineOrders(threshold);
            log.info("📦 Phát hiện {} đơn hàng online quá hạn thanh toán (>15 phút).", abandonedOrders.size());
            for (Order order : abandonedOrders) {
                cancelOrder(order, "Hết thời gian chờ thanh toán trực tuyến", false);
                log.info("❌ Đã hủy đơn hàng online quá hạn: ID {}", order.getId());
                executionDetails.add(String.format("Đã hủy đơn %d (Online quá hạn)", order.getId()));
                cancelled++;
                processed++;
            }

            // 2. Process COD Orders via AI
            List<Order> pendingCodOrders = orderRepository.findPendingCodOrders();
            log.info("📦 Phát hiện {} đơn hàng COD đang chờ duyệt.", pendingCodOrders.size());
            for (Order order : pendingCodOrders) {
                processed++;
                log.info("🧠 Đang gửi đơn hàng ID {} sang AI (Gemini) để phân tích rủi ro...", order.getId());
                String aiDecision = analyzeOrderWithAI(order);

                if (aiDecision == null) {
                    log.error("⚠️ Lỗi kết nối API Server AI cho đơn hàng ID {}", order.getId());
                    executionDetails.add(String.format("Lỗi kết nối AI cho đơn %d", order.getId()));
                    continue;
                }

                log.info("💬 Phản hồi từ AI cho đơn hàng ID {}: {}", order.getId(), aiDecision);
                try {
                    JsonNode node = objectMapper.readTree(aiDecision);
                    String action = node.has("action") ? node.get("action").asText() : "UNKNOWN";
                    String reason = node.has("reason") ? node.get("reason").asText() : "";

                    if ("CANCEL".equals(action)) {
                        suggestCancelOrder(order, "AI Hủy: " + reason);
                        log.info("❌ AI phán quyết HỦY đơn hàng ID {}. Lý do: {}", order.getId(), reason);
                        executionDetails.add(String.format("AI YÊU CẦU HỦY đơn %d: %s", order.getId(), reason));
                        cancelled++;
                    } else if ("CONFIRM".equals(action)) {
                        confirmOrder(order);
                        log.info("✅ AI phán quyết DUYỆT đơn hàng ID {}", order.getId());
                        executionDetails.add(String.format("AI DUYỆT đơn %d", order.getId()));
                        confirmed++;
                    } else {
                        log.warn("⚠️ AI yêu cầu duyệt thủ công (MANUAL_REVIEW) cho đơn hàng ID {}. Lý do: {}",
                                order.getId(), reason);
                        executionDetails
                                .add(String.format("AI YÊU CẦU MANUAL_REVIEW đơn %d: %s", order.getId(), reason));
                    }
                } catch (Exception ex) {
                    log.error("⚠️ Lỗi phân tích cú pháp (parse) phản hồi AI cho đơn hàng ID {}", order.getId(), ex);
                    executionDetails
                            .add(String.format("Lỗi parse phản hồi AI cho đơn %d: %s", order.getId(), ex.getMessage()));
                }
            }

            log.info("🎉 Hoàn thành luồng duyệt đơn hàng AI. Tổng quét: {}, Duyệt: {}, Hủy: {}", processed, confirmed,
                    cancelled);
            jobLog.setStatus("SUCCESS");
        } catch (Exception e) {
            log.error("💥 Lỗi nghiêm trọng trong luồng tự động duyệt đơn hàng", e);
            jobLog.setStatus("ERROR");
            executionDetails.add("ERROR FATAL: " + e.getMessage());
        } finally {
            jobLog.setEndTime(LocalDateTime.now());
            jobLog.setOrdersProcessed(processed);
            jobLog.setOrdersCancelled(cancelled);
            jobLog.setOrdersConfirmed(confirmed);
            try {
                jobLog.setDetails(objectMapper.writeValueAsString(executionDetails));
            } catch (Exception ignored) {
            }
            logRepository.save(jobLog);
        }
    }

    @Transactional
    protected void suggestCancelOrder(Order order, String reason) {
        order.setOrderStatus("AI_CANCEL_SUGGESTED");
        order.setCancelReason(reason);
        orderRepository.save(order);
    }

    @Transactional
    protected void cancelOrder(Order order, String reason, boolean shouldRestock) {
        order.setOrderStatus("CANCELLED");
        order.setCancelReason(reason);

        if (shouldRestock && order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getVariant() != null && !Boolean.TRUE.equals(item.getIsRestocked())) {
                    ProductVariant variant = item.getVariant();
                    variant.setStock(variant.getStock() + item.getQuantity());
                    productVariantRepository.save(variant);
                    item.setIsRestocked(true);
                }
            }
        }
        orderRepository.save(order);
    }

    @Transactional
    protected void confirmOrder(Order order) {
        order.setOrderStatus("PROCESSING");
        orderRepository.save(order);
    }

    private String analyzeOrderWithAI(Order order) {
        try {
            User user = order.getUser();
            Long userId = user.getId();

            LocalDateTime createdAt = user.getCreatedAt() != null ? user.getCreatedAt() : order.getCreatedAt();
            if (createdAt == null) createdAt = LocalDateTime.now();
            long accountAgeDays = ChronoUnit.DAYS.between(createdAt.toLocalDate(), LocalDate.now());
            long successful = orderRepository.countByUserIdAndOrderStatusIn(userId, Arrays.asList("DELIVERED"));
            long cancelledOrders = orderRepository.countByUserIdAndOrderStatusIn(userId, Arrays.asList("CANCELLED"));
            long failed = orderRepository.countByUserIdAndOrderStatusIn(userId, Arrays.asList("FAILED_DELIVERY"));
            long last24h = orderRepository.countByUserIdAndCreatedAtAfter(userId, LocalDateTime.now().minusHours(24));

            String rName = order.getReceiverName();
            if (rName == null || rName.trim().isEmpty()) {
                if (order.getAddress() != null) rName = order.getAddress().getReceiverName();
            }
            if (rName == null || rName.trim().isEmpty()) rName = user.getName();

            String rPhone = order.getPhone();
            if (rPhone == null || rPhone.trim().isEmpty()) {
                if (order.getAddress() != null) rPhone = order.getAddress().getPhone();
            }
            if (rPhone == null || rPhone.trim().isEmpty()) rPhone = user.getPhone();

            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("orderId", order.getId());
            requestMap.put("totalAmount", order.getTotalAmount());
            requestMap.put("paymentMethod", order.getPaymentMethod());
            requestMap.put("receiverName", rName != null ? rName : "");
            requestMap.put("phone", rPhone != null ? rPhone : "");
            requestMap.put("shippingAddress", order.getAddress() != null ? order.getAddress().getAddress() : "");
            requestMap.put("orderTime",
                    order.getCreatedAt() != null ? order.getCreatedAt().toString() : LocalDateTime.now().toString());
            requestMap.put("voucherCode", order.getVoucher() != null ? order.getVoucher().getCode() : null);

            List<Map<String, Object>> items = new ArrayList<>();
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    Map<String, Object> iMap = new HashMap<>();
                    iMap.put("productName",
                            item.getVariant() != null && item.getVariant().getProduct() != null
                                    ? item.getVariant().getProduct().getName()
                                    : "Unknown");
                    iMap.put("quantity", item.getQuantity());
                    iMap.put("price", item.getPrice());
                    items.add(iMap);
                }
            }
            requestMap.put("items", items);

            requestMap.put("accountAgeDays", accountAgeDays);
            requestMap.put("totalSuccessfulOrders", successful);
            requestMap.put("totalCancelledOrders", cancelledOrders);
            requestMap.put("totalFailedDeliveries", failed);
            requestMap.put("ordersInLast24h", last24h);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(requestMap), headers);

            ResponseEntity<String> response = restTemplate.postForEntity("http://localhost:8000/analyze-order", request,
                    String.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("❌ Lỗi trong quá trình chuẩn bị dữ liệu gửi AI cho đơn hàng ID {}: {}", order.getId(),
                    e.getMessage(), e);
            return null;
        }
    }
}
