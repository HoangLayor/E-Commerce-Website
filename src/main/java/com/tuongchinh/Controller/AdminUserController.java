package com.tuongchinh.Controller;

import com.tuongchinh.Entity.User;
import com.tuongchinh.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<com.tuongchinh.DTO.CustomerResponse>> getAllCustomers() {
        return ResponseEntity.ok(userService.getCustomersWithStats("USER"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.tuongchinh.DTO.CustomerResponse> getCustomerDetail(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getCustomerById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<User> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        return ResponseEntity.ok(userService.toggleUserStatus(id, active));
    }
}
