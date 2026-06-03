package com.tuongchinh.Controller;

import com.tuongchinh.DTO.AddressRequest;
import com.tuongchinh.DTO.AddressResponse;
import com.tuongchinh.Service.AddressService;
import com.tuongchinh.Service.JwtService;
import com.tuongchinh.Service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final JwtService jwtService;
    private final UserService userService;

    // Lấy danh sách địa chỉ
    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses(HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        return ResponseEntity.ok(addressService.getAddresses(userId));
    }

    // Thêm địa chỉ mới
    @PostMapping
    public ResponseEntity<?> addAddress(
            @RequestBody AddressRequest body,
            HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        addressService.addAddress(userId, body);
        return ResponseEntity.ok("added to adress successfuly");
    }

    // Sửa địa chỉ
    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @RequestBody AddressRequest body,
            HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        return ResponseEntity.ok(addressService.updateAddress(userId, id, body));
    }

    // Xóa địa chỉ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long id,
            HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        addressService.deleteAddress(userId, id);
        return ResponseEntity.noContent().build();
    }

    // Set địa chỉ mặc định
    @PutMapping("/{id}/default")
    public ResponseEntity<AddressResponse> setDefault(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = extractUserId(request);
        return ResponseEntity.ok(addressService.setDefault(userId, id));
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = userService.extractToken(request);
        return jwtService.extractUserId(token);
    }
}
