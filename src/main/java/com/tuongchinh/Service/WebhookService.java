package com.tuongchinh.Service;

import com.tuongchinh.DTO.WebhookOrderDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@Slf4j
public class WebhookService {

    private final String webhookUrl = "https://your-n8n-domain/webhook/order-created";
    private final String apiKey = "MY_SECRET_KEY";

    private final RestTemplate restTemplate;

    public WebhookService() {
        this.restTemplate = new RestTemplate();
    }

    public void triggerWebhookForOrders(List<WebhookOrderDTO> orders) {
        for (WebhookOrderDTO order : orders) {
            sendWebhookWithRetry(order, 3);
        }
    }

    private void sendWebhookWithRetry(WebhookOrderDTO order, int maxRetries) {
        int attempt = 0;
        boolean success = false;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);

        HttpEntity<WebhookOrderDTO> request = new HttpEntity<>(order, headers);

        while (attempt < maxRetries && !success) {
            attempt++;
            try {
                log.info("Attempt {} to trigger webhook for order {}", attempt, order.getOrder_id());
                ResponseEntity<String> response = restTemplate.postForEntity(webhookUrl, request, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    log.info("Successfully triggered webhook for order {}", order.getOrder_id());
                    success = true;
                } else {
                    log.warn("Failed to trigger webhook for order {}, Status Code: {}", order.getOrder_id(), response.getStatusCode());
                }
            } catch (Exception e) {
                log.error("Exception occurred while triggering webhook for order {}: {}", order.getOrder_id(), e.getMessage());
                if (attempt >= maxRetries) {
                    log.error("Max retries reached for order {}. Giving up.", order.getOrder_id());
                } else {
                    try {
                        Thread.sleep(2000); // 2 second delay between retries
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }
    }
}
