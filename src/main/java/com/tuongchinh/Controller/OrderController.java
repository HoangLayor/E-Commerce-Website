package com.tuongchinh.Controller;

import com.tuongchinh.DTO.CheckoutRequest;
import com.tuongchinh.DTO.OrderResponse;
import com.tuongchinh.DTO.OrderUptateStatusRequest;
import com.tuongchinh.Service.JwtService;
import com.tuongchinh.Service.OrderService;
import com.tuongchinh.Service.UserService;
import com.tuongchinh.Service.OrderExportService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final JwtService jwtService;
    private final OrderExportService orderExportService;

    // POST /api/orders/checkout
    @PostMapping("user/orders/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @RequestBody CheckoutRequest req,
            HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        OrderResponse response = orderService.checkout(userId, req, request);
        return ResponseEntity.ok(response);
    }

    // GET /api/user/orders
    @GetMapping("user/orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    // GET /api/user/orders/{id}
    @GetMapping("user/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderDetail(
            HttpServletRequest request,
            @PathVariable Long id) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        return ResponseEntity.ok(orderService.getOrderDetail(userId, id));
    }

    // PUT /api/user/orders/{id}/cancel
    @PutMapping("/user/orders/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestParam String reason) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        return ResponseEntity.ok(orderService.cancelOrder(userId, id, reason));
    }

    // POST /api/user/orders/{id}/refund
    @PostMapping("/user/orders/{id}/refund")
    public ResponseEntity<OrderResponse> requestRefund(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        String reason = body.get("reason");
        String accountInfo = body.get("accountInfo");
        return ResponseEntity.ok(orderService.requestRefund(userId, id, reason, accountInfo));
    }

    // =====================
    // ADMIN ENDPOINTS
    // =====================

    @GetMapping("/admin/orders/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/admin/orders/user/{userId}")
    public ResponseEntity<List<OrderResponse>> adminGetOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/admin/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/admin/orders/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @RequestBody OrderUptateStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(request));
    }

    // POST /api/admin/orders/{orderId}/items/{itemId}/restock
    @PostMapping("/admin/orders/{orderId}/items/{itemId}/restock")
    public ResponseEntity<OrderResponse> restockOrderItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(orderService.restockOrderItem(orderId, itemId));
    }

    // POST /api/admin/orders/{id}/refund-confirm
    @PostMapping("/admin/orders/{id}/refund-confirm")
    public ResponseEntity<OrderResponse> confirmRefund(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        String refundAttachmentUrl = payload.get("refundAttachmentUrl");
        return ResponseEntity.ok(orderService.refundOrder(id, refundAttachmentUrl));
    }

    @GetMapping("/admin/orders/export")
    public void exportOrders(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");
        orderExportService.exportOrdersToExcel(response.getOutputStream());
    }

    // =====================
    // AUTOMATION ENDPOINTS
    // =====================

    @GetMapping("/admin/automation/suggested-cancels")
    public ResponseEntity<List<OrderResponse>> getAiSuggestedCancelOrders() {
        return ResponseEntity.ok(orderService.getAiSuggestedCancelOrders());
    }

    @PostMapping("/admin/automation/bulk-cancel")
    public ResponseEntity<String> bulkCancelOrders(@RequestBody java.util.Map<String, List<Long>> payload) {
        List<Long> orderIds = payload.get("orderIds");
        if (orderIds != null && !orderIds.isEmpty()) {
            orderService.bulkCancelOrders(orderIds);
        }
        return ResponseEntity.ok("Success");
    }

    @GetMapping("/admin/orders/{id}/risk-profile")
    public ResponseEntity<com.tuongchinh.DTO.OrderRiskProfileResponse> getOrderRiskProfile(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderRiskProfile(id));
    }
}