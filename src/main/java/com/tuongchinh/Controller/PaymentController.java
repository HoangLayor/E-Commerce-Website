package com.tuongchinh.Controller;

import com.tuongchinh.Service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${app.frontend.url:https://www.hoanglayor.id.vn/}")
    private String frontendUrl;

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> params) {

        try {
            String result = paymentService.handleVNPayCallback(params);
            if ("SUCCESS".equals(result)) {
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", frontendUrl + "/payment-result?status=success")
                        .build();
            } else {
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", frontendUrl + "/payment-result?status=fail")
                        .build();
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl + "/payment-result?status=error")
                    .build();
        }
    }

    @PostMapping("/pay-again/{orderId}")
    public ResponseEntity<?> payAgain(@PathVariable Long orderId,
            HttpServletRequest request) {
        try {
            // String paymentUrl = paymentService.payAgain(orderId, request);
            // return ResponseEntity.ok(paymentUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return null;
    }
}