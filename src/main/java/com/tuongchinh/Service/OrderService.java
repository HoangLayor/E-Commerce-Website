package com.tuongchinh.Service;

import com.tuongchinh.DTO.CheckoutRequest;
import com.tuongchinh.DTO.OrderItemDTO;
import com.tuongchinh.DTO.OrderResponse;
import com.tuongchinh.DTO.OrderUptateStatusRequest;
import com.tuongchinh.Entity.*;
import com.tuongchinh.Repository.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserService userService;
    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final AddressRepository addressRepository;
    private final PaymentService paymentService;
    private final ProductRepository productRepository;
    private final FlashSaleProductRepository flashSaleProductRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest req, HttpServletRequest request) {
        validateCheckoutRequest(req);
        List<CartItem> cartItems = cartItemRepository.findAllByIdIn(req.getCartItemIds());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("No items selected");
        }
        Address address;
        if (req.getAddressId() != null) {
            address = addressRepository.findById(req.getAddressId())
                    .orElseThrow(() -> new RuntimeException("Address not found"));

            if (!address.getUser().getId().equals(userId)) {
                throw new RuntimeException("Address does not belong to user");
            }

        } else {
            address = addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .orElseThrow(() -> new RuntimeException("No default address found"));
        }

        BigDecimal total = BigDecimal.ZERO;

        // 3. Kiểm tra variant và tính tiền
        for (CartItem item : cartItems) {
            if (!item.getCart().getUser().getId().equals(userId)) {
                throw new RuntimeException("Invalid cart item");
            }
            ProductVariant variant = item.getVariant();
            if (variant == null) {
                throw new RuntimeException("Cart item missing product variant");
            }
            if (!Boolean.TRUE.equals(variant.getIsActive())) {
                throw new RuntimeException("Variant " + variant.getSku() + " is no longer available");
            }

            // stock dùng đúng tên field "stock" theo entity
            if (variant.getStock() < item.getQuantity()) {
                throw new RuntimeException(
                        "Product " + variant.getProduct().getName()
                                + " (SKU: " + variant.getSku() + ") out of stock");
            }

            // Dùng getEffectivePrice() → ưu tiên discountPrice nếu có
            BigDecimal price = variant.getEffectivePrice();
            total = total.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // 4. Áp voucher (nếu có)
        Voucher appliedVoucher = null;
        if (req.getVoucherCode() != null && !req.getVoucherCode().trim().isEmpty()) {

            Voucher voucher = voucherRepository.findByCode(req.getVoucherCode())
                    .orElseThrow(() -> new RuntimeException("Voucher not found"));

            // Dùng isValid() có sẵn trong entity
            if (!voucher.isValid()) {
                throw new RuntimeException("Voucher is invalid or expired");
            }

            // Kiểm tra user đã dùng chưa
            if (voucherUsageRepository.existsByVoucherIdAndUserId(voucher.getId(), userId)) {
                throw new RuntimeException("You have already used this voucher");
            }

            // Kiểm tra giá trị đơn tối thiểu
            if (total.compareTo(voucher.getMinOrderValue()) < 0) {
                throw new RuntimeException(
                        "Minimum order value is " + voucher.getMinOrderValue() + " to apply this voucher");
            }

            BigDecimal discount;
            switch (voucher.getType()) {
                case "PERCENT" -> {
                    discount = total.multiply(voucher.getValue())
                            .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                }
                case "FIXED" -> {
                    discount = voucher.getValue();
                }
                case "SHIPPING" -> {
                    // Phí ship xử lý riêng — tạm thời bỏ qua hoặc trừ thẳng
                    discount = voucher.getValue();
                }
                default -> throw new RuntimeException("Unknown voucher type: " + voucher.getType());
            }

            // Giới hạn maxDiscount
            if (voucher.getMaxDiscount() != null &&
                    discount.compareTo(voucher.getMaxDiscount()) > 0) {
                discount = voucher.getMaxDiscount();
            }

            total = total.subtract(discount).max(BigDecimal.ZERO); // không để total âm

            // Cập nhật usedCount
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            voucherRepository.save(voucher);

            appliedVoucher = voucher;
        }

        // 5. Tạo Order
        Order order = new Order();
        order.setUser(userService.findById(userId));
        order.setTotalAmount(total);
        order.setOrderStatus("PENDING");
        order.setStatus("UNPAID");
        order.setAddress(address);
        order.setPaymentMethod(req.getPaymentMethod());
        orderRepository.save(order);

        // 6. Tạo OrderItems
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getVariant();
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(item.getVariant());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(variant.getEffectivePrice()); // snapshot giá tại thời điểm mua
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);

        // 7. Lưu lịch sử dùng voucher
        if (appliedVoucher != null) {
            VoucherUsage usage = new VoucherUsage();
            usage.setVoucher(appliedVoucher);
            usage.setUserId(userId);
            usage.setUsedAt(LocalDateTime.now());
            voucherUsageRepository.save(usage);
        }

        if ("COD".equalsIgnoreCase(req.getPaymentMethod())) {
            processSuccessfulOrder(order);
        }

        String paymentResult;
        try {
            paymentResult = paymentService.processPayment(
                    order,
                    req.getPaymentMethod(),
                    request // ⚠️ cần truyền HttpServletRequest
            );
        } catch (Exception e) {
            throw new RuntimeException("Payment error: " + e.getMessage());
        }

        // 10. Trả về response
        OrderResponse response = mapToOrderResponse(order);
        if ("VNPAY".equals(req.getPaymentMethod())) {
            response.setPaymentUrl(paymentResult);
        }
        return response;
    }

    @Transactional
    public void processSuccessfulOrder(Order order) {
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                ProductVariant variant = item.getVariant();
                if (variant != null) {
                    if (variant.getStock() < item.getQuantity()) {
                        throw new RuntimeException("Product " + variant.getProduct().getName() + " is out of stock!");
                    }
                    variant.setStock(variant.getStock() - item.getQuantity());
                    productVariantRepository.save(variant);

                    // Update flash sale
                    java.util.Optional<FlashSaleProduct> activeFlashSale = flashSaleProductRepository.findActiveByVariantId(variant.getId());
                    if (activeFlashSale.isPresent()) {
                        FlashSaleProduct fsp = activeFlashSale.get();
                        fsp.setSoldQuantity(fsp.getSoldQuantity() + item.getQuantity());
                        flashSaleProductRepository.save(fsp);
                    }
                }
            }
        }

        // Clear cart items for this order
        if (order.getItems() != null) {
            List<Long> variantIds = order.getItems().stream()
                    .map(item -> item.getVariant().getId())
                    .collect(Collectors.toList());
            cartItemRepository.deleteByCartUserIdAndVariantIdIn(order.getUser().getId(), variantIds);
        }
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .filter(order -> !"FAILED".equalsIgnoreCase(order.getOrderStatus()))
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(OrderUptateStatusRequest request) {
        Order order = orderRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(request.getStatus());
        if (request.getStatus().equals("DELIVERED")) {
            order.setStatus("PAID");
            updateSoldCount(order);
        } else if (request.getStatus().equals("CANCELLED") || request.getStatus().equals("FAILED_DELIVERY")) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    if (item.getVariant() != null && !Boolean.TRUE.equals(item.getIsRestocked())) {
                        ProductVariant variant = item.getVariant();
                        variant.setStock(variant.getStock() + item.getQuantity());
                        productVariantRepository.save(variant);
                        item.setIsRestocked(true);
                    }
                }
            }
        }
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public void updateSoldCount(Order order) {
        if (order.getIsSoldCountUpdated() != null && order.getIsSoldCountUpdated()) {
            return; // Already updated
        }

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                ProductVariant variant = item.getVariant();
                Product product = variant.getProduct();
                int quantity = item.getQuantity();

                // update variant
                int vSold = (variant.getTotalSold() == null) ? 0 : variant.getTotalSold();
                variant.setTotalSold(vSold + quantity);
                productVariantRepository.save(variant);

                // update product
                int pSold = (product.getTotalSold() == null) ? 0 : product.getTotalSold();
                product.setTotalSold(pSold + quantity);
                productRepository.save(product);
            }
        }
        order.setIsSoldCountUpdated(true);
        orderRepository.save(order);
    }

    public OrderResponse getOrderDetail(Long userId, Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
        return mapToOrderResponse(order);
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long id, String reason) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
        if (!"PENDING".equalsIgnoreCase(order.getOrderStatus())) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Lý do hủy đơn là bắt buộc");
        }
        order.setOrderStatus("CANCELLED");
        order.setCancelReason(reason);

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getVariant() != null && !Boolean.TRUE.equals(item.getIsRestocked())) {
                    ProductVariant variant = item.getVariant();
                    variant.setStock(variant.getStock() + item.getQuantity());
                    productVariantRepository.save(variant);
                    item.setIsRestocked(true);
                }
            }
        }

        return mapToOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse requestRefund(Long userId, Long id, String reason, String accountInfo) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
        if (!"FAILED_DELIVERY".equalsIgnoreCase(order.getOrderStatus())) {
            throw new RuntimeException("Chỉ đơn hàng giao thất bại mới được yêu cầu hoàn tiền");
        }
        if (!"PAID".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Chỉ đơn hàng đã thanh toán mới được yêu cầu hoàn tiền");
        }
        if (reason == null || reason.trim().isEmpty() || accountInfo == null || accountInfo.trim().isEmpty()) {
            throw new RuntimeException("Lý do và thông tin tài khoản hoàn tiền là bắt buộc");
        }
        order.setIsRefundRequested(true);
        order.setRefundReason(reason);
        order.setRefundAccountInfo(accountInfo);
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse restockOrderItem(Long orderId, Long itemId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!"CANCELLED".equalsIgnoreCase(order.getOrderStatus()) && !"FAILED_DELIVERY".equalsIgnoreCase(order.getOrderStatus()) && !"REFUNDED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new RuntimeException("Chỉ đơn hàng đã hủy hoặc giao thất bại mới được hoàn kho");
        }
        OrderItem itemToRestock = order.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong đơn hàng"));

        if (Boolean.TRUE.equals(itemToRestock.getIsRestocked())) {
            throw new RuntimeException("Sản phẩm này đã được hoàn kho trước đó");
        }

        ProductVariant variant = itemToRestock.getVariant();
        if (variant != null) {
            variant.setStock(variant.getStock() + itemToRestock.getQuantity());
            productVariantRepository.save(variant);
        }

        itemToRestock.setIsRestocked(true);
        return mapToOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse refundOrder(Long id, String refundAttachmentUrl) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!"FAILED_DELIVERY".equalsIgnoreCase(order.getOrderStatus()) && !"CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new RuntimeException("Chỉ đơn hàng giao thất bại hoặc đã hủy mới có thể hoàn tiền");
        }
        order.setStatus("REFUNDED");
        order.setOrderStatus("REFUNDED");
        if (refundAttachmentUrl != null && refundAttachmentUrl.startsWith("data:image")) {
            String uploadedUrl = cloudinaryService.uploadBase64Image(refundAttachmentUrl);
            order.setRefundAttachmentUrl(uploadedUrl);
        } else {
            order.setRefundAttachmentUrl(refundAttachmentUrl);
        }
        return mapToOrderResponse(orderRepository.save(order));
    }

    public List<OrderResponse> getAiSuggestedCancelOrders() {
        return orderRepository.findAiSuggestedCancelOrders().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void bulkCancelOrders(List<Long> orderIds) {
        for (Long id : orderIds) {
            Order order = orderRepository.findById(id).orElse(null);
            if (order != null && "AI_CANCEL_SUGGESTED".equals(order.getOrderStatus())) {
                order.setOrderStatus("CANCELLED");
                if (order.getItems() != null) {
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
        }
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse res = new OrderResponse();
        res.setId(order.getId());
        res.setOrderStatus(order.getOrderStatus());
        res.setPaymentStatus(order.getStatus());
        res.setPaymentMethod(order.getPaymentMethod());
        res.setTotalPrice(order.getTotalAmount());
        res.setOrderDate(order.getOrderDate());
        res.setDiscountAmount(order.getDiscountAmount());
        res.setCancelReason(order.getCancelReason());
        res.setIsRefundRequested(order.getIsRefundRequested());
        res.setRefundReason(order.getRefundReason());
        res.setRefundAccountInfo(order.getRefundAccountInfo());
        res.setRefundAttachmentUrl(order.getRefundAttachmentUrl());
        if (order.getVoucher() != null) {
            res.setVoucherCode(order.getVoucher().getCode());
        }
        // Lấy từ Address entity
        if (order.getAddress() != null) {
            res.setShippingAddress(order.getAddress().getAddress());
            res.setReceiverName(order.getAddress().getReceiverName());
            res.setPhone(order.getAddress().getPhone());
        }
        if (order.getItems() != null) {
            res.setItems(order.getItems().stream().map(item -> {
                OrderItemDTO dto = new OrderItemDTO();
                dto.setId(item.getId());
                dto.setQuantity(item.getQuantity());
                dto.setPrice(item.getPrice());
                dto.setIsRestocked(item.getIsRestocked());
                if (item.getVariant() != null) {
                    ProductVariant v = item.getVariant();
                    dto.setVariantId(v.getId());
                    dto.setSku(v.getSku());
                    if (v.getProduct() != null) {
                        dto.setProductId(v.getProduct().getId());
                        dto.setProductName(v.getProduct().getName());
                    }
                    // For variant name, we can use attribute values if available
                    // For now, let's keep it simple or join attribute names
                    dto.setVariantName(v.getSku()); // Fallback to SKU
                    dto.setImageUrl(v.getImageUrl());
                }
                return dto;
            }).collect(Collectors.toList()));
        }
        return res;
    }

    private void validateCheckoutRequest(CheckoutRequest req) {
        if (req.getPaymentMethod() == null || req.getPaymentMethod().trim().isEmpty()) {
            throw new RuntimeException("Payment method is required");
        }
        List<String> allowedMethods = Arrays.asList("COD", "VNPAY", "MOMO");
        if (!allowedMethods.contains(req.getPaymentMethod().toUpperCase())) {
            throw new RuntimeException("Invalid payment method: " + req.getPaymentMethod());
        }
    }

    public com.tuongchinh.DTO.OrderRiskProfileResponse getOrderRiskProfile(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        User user = order.getUser();
        Long userId = user.getId();

        java.time.LocalDateTime createdAt = user.getCreatedAt() != null ? user.getCreatedAt() : order.getCreatedAt();
        if (createdAt == null) createdAt = java.time.LocalDateTime.now();
        long accountAgeDays = java.time.temporal.ChronoUnit.DAYS.between(createdAt.toLocalDate(), java.time.LocalDate.now());

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

        long successful = orderRepository.countByUserIdAndOrderStatusIn(userId, java.util.Arrays.asList("DELIVERED"));
        long cancelledOrders = orderRepository.countByUserIdAndOrderStatusIn(userId, java.util.Arrays.asList("CANCELLED"));
        long failed = orderRepository.countByUserIdAndOrderStatusIn(userId, java.util.Arrays.asList("FAILED_DELIVERY"));
        long last24h = orderRepository.countByUserIdAndCreatedAtAfter(userId, java.time.LocalDateTime.now().minusHours(24));

        com.tuongchinh.DTO.OrderRiskProfileResponse profile = new com.tuongchinh.DTO.OrderRiskProfileResponse();
        profile.setAccountAgeDays(accountAgeDays);
        profile.setTotalSuccessfulOrders(successful);
        profile.setTotalCancelledOrders(cancelledOrders);
        profile.setTotalFailedDeliveries(failed);
        profile.setOrdersInLast24h(last24h);
        profile.setTotalAmount(order.getTotalAmount());
        profile.setPaymentMethod(order.getPaymentMethod());
        profile.setOrderTime(order.getCreatedAt());
        profile.setVoucherCode(order.getVoucher() != null ? order.getVoucher().getCode() : null);
        profile.setReceiverName(rName != null ? rName : "");
        profile.setPhone(rPhone != null ? rPhone : "");
        profile.setShippingAddress(order.getAddress() != null ? order.getAddress().getAddress() : "");
        
        if (order.getItems() != null) {
            profile.setItems(order.getItems().stream().map(item -> {
                com.tuongchinh.DTO.OrderItemDTO dto = new com.tuongchinh.DTO.OrderItemDTO();
                dto.setId(item.getId());
                dto.setQuantity(item.getQuantity());
                dto.setPrice(item.getPrice());
                if (item.getVariant() != null && item.getVariant().getProduct() != null) {
                    dto.setProductName(item.getVariant().getProduct().getName());
                    dto.setImageUrl(item.getVariant().getImageUrl());
                }
                return dto;
            }).collect(Collectors.toList()));
        }
        return profile;
    }
}