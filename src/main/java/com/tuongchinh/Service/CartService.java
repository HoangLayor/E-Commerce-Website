package com.tuongchinh.Service;

import com.tuongchinh.Entity.*;
import com.tuongchinh.Repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final FlashSaleProductRepository flashSaleProductRepository;

    // Thêm vào giỏ hàng
    public void addToCart(Long userId, Long variantId, int quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + userId));
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy variant: " + variantId));

        if (variant.getStock() < quantity) {
            throw new RuntimeException("Không đủ hàng, chỉ còn " + variant.getStock() + " sản phẩm");
        }

        // Nếu variant đã có trong giỏ → cộng thêm số lượng
        Optional<CartItem> existing = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variantId);
        
        int newQty = quantity;
        if (existing.isPresent()) {
            newQty = existing.get().getQuantity() + quantity;
        }

        if (variant.getStock() < newQty) {
            throw new RuntimeException("Không đủ hàng, chỉ còn " + variant.getStock() + " sản phẩm");
        }

        // Kiểm tra Flash Sale Limit
        Optional<FlashSaleProduct> activeFlashSale = flashSaleProductRepository.findActiveByVariantId(variantId);
        if (activeFlashSale.isPresent()) {
            FlashSaleProduct fsp = activeFlashSale.get();
            if (newQty > fsp.getMaxUser()) {
                throw new RuntimeException("Sản phẩm đang trong Flash Sale, bạn chỉ được mua tối đa " + fsp.getMaxUser() + " sản phẩm");
            }
            int availableFlashSaleStock = fsp.getQuantity() - fsp.getSoldQuantity();
            if (newQty > availableFlashSaleStock) {
                throw new RuntimeException("Kho Flash Sale chỉ còn " + availableFlashSaleStock + " sản phẩm");
            }
        }

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setVariant(variant);
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
    }

    // Cập nhật số lượng
    public CartItem updateQuantity(Long userId, Long variantId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));

        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ"));

        ProductVariant variant = item.getVariant();

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
            return null;
        }

        if (variant.getStock() < quantity) {
            throw new RuntimeException("Không đủ hàng, chỉ còn " + variant.getStock() + " sản phẩm");
        }

        // Kiểm tra Flash Sale Limit
        Optional<FlashSaleProduct> activeFlashSale = flashSaleProductRepository.findActiveByVariantId(variantId);
        if (activeFlashSale.isPresent()) {
            FlashSaleProduct fsp = activeFlashSale.get();
            if (quantity > fsp.getMaxUser()) {
                throw new RuntimeException("Sản phẩm đang trong Flash Sale, bạn chỉ được mua tối đa " + fsp.getMaxUser() + " sản phẩm");
            }
            int availableFlashSaleStock = fsp.getQuantity() - fsp.getSoldQuantity();
            if (quantity > availableFlashSaleStock) {
                throw new RuntimeException("Kho Flash Sale chỉ còn " + availableFlashSaleStock + " sản phẩm");
            }
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    // Xóa 1 sản phẩm khỏi giỏ
    public void removeFromCart(Long userId, Long variantId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));

        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
    }

    // Xem giỏ hàng
    public Cart getCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));
    }

    // Xóa toàn bộ giỏ hàng (dùng sau khi đặt hàng xong)
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));
        cartItemRepository.deleteByCartId(cart.getId()); // ← dùng cái này
    }

}