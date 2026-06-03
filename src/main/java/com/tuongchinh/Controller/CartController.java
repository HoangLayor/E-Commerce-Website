package com.tuongchinh.Controller;

import com.tuongchinh.DTO.CartItemDTO;
import com.tuongchinh.DTO.ProductResponse;
import com.tuongchinh.Entity.Cart;
import com.tuongchinh.Service.JwtService;
import com.tuongchinh.Service.CartService;
import com.tuongchinh.Service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/cart")
public class CartController {

    private final CartService cartService;
    private final JwtService jwtService;
    private final UserService userService;

    public CartController(CartService cartService, JwtService jwtService, UserService userService) {
        this.cartService = cartService;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    // Thêm vào giỏ hàng
    @PostMapping
    public ResponseEntity<?> addToCart(
            @RequestParam Long variantId,
            @RequestParam int quantity,
            HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        cartService.addToCart(userId, variantId, quantity);
        return ResponseEntity.ok("added to cart successfully");
    }

    // Xem giỏ hàng
    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getMyCart(HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        Cart cart = cartService.getCart(userId);

        List<CartItemDTO> result = cart.getItems().stream()
                .map(item -> {
                    CartItemDTO dto = new CartItemDTO();
                    dto.setId(item.getId());
                    dto.setQuantity(item.getQuantity());

                    // Thông tin variant
                    dto.setVariantId(item.getVariant().getId());
                    dto.setSku(item.getVariant().getSku());
                    dto.setPrice(item.getVariant().getPrice());
                    dto.setDiscountPrice(item.getVariant().getDiscountPrice());
                    dto.setEffectivePrice(item.getVariant().getEffectivePrice());
                    dto.setVariantImageUrl(item.getVariant().getImageUrl());

                    // Thông tin product
                    dto.setProductId(item.getVariant().getProduct().getId());
                    dto.setProductName(item.getVariant().getProduct().getName());
                    dto.setBrandName(item.getVariant().getProduct().getBrand() != null
                            ? item.getVariant().getProduct().getBrand().getName()
                            : null);

                    // Tổng tiền dòng này
                    dto.setSubtotal(item.getVariant().getEffectivePrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity())));

                    if (item.getVariant().getAttributeValues() != null) {
                        dto.setAttributeValues(item.getVariant().getAttributeValues().stream().map(av -> {
                            ProductResponse.AttributeValueResponse avr = new ProductResponse.AttributeValueResponse();
                            avr.setName(av.getAttribute().getName());
                            avr.setValue(av.getValue());
                            return avr;
                        }).collect(Collectors.toList()));
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Cập nhật số lượng
    @PutMapping("/{variantId}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Long variantId,
            @RequestParam int quantity,
            HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        cartService.updateQuantity(userId, variantId, quantity);
        return ResponseEntity.ok("Cập nhật số lượng thành công");
    }

    // Xóa 1 sản phẩm khỏi giỏ
    @DeleteMapping("/{variantId}")
    public ResponseEntity<?> removeFromCart(
            @PathVariable Long variantId,
            HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        cartService.removeFromCart(userId, variantId);
        return ResponseEntity.ok("Xóa sản phẩm khỏi giỏ hàng thành công");
    }

    // Xóa toàn bộ giỏ hàng
    @DeleteMapping
    public ResponseEntity<?> clearCart(HttpServletRequest request) {
        Long userId = extractUserId(request);
        cartService.clearCart(userId);
        return ResponseEntity.ok("Đã xóa toàn bộ giỏ hàng");
    }

    // Tách ra method dùng chung
    private Long extractUserId(HttpServletRequest request) {
        String token = userService.extractToken(request);
        return jwtService.extractUserId(token);
    }
}