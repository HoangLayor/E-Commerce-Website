package com.tuongchinh.Controller;

import com.tuongchinh.DTO.ChangePasswordRequest;
import com.tuongchinh.DTO.LoginRequest;
import com.tuongchinh.DTO.RegisterRequest;
import com.tuongchinh.DTO.UserRequest;
import com.tuongchinh.Entity.User;
import com.tuongchinh.Service.JwtService;
import com.tuongchinh.Service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {
    @Autowired
    private UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("author/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {
        User user = userService.findByEmail(request.getEmail());

        if (user == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Sai email hoặc mật khẩu");
        }
        String jwt = jwtService.generateToken(String.valueOf(user.getId()));
        ResponseCookie cookie = ResponseCookie.from("token", jwt)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(60 * 60)
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of(
                "message", "Đăng nhập thành công",
                "email", user.getEmail(),
                "role", user.getRole()));
    }

    @PostMapping("author/register")
    public String register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("author/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().body("Logout successful");
    }

    @GetMapping("user/me")
    public UserRequest getProfile(HttpServletRequest request) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        User user = userService.findById(userId);
        UserRequest userRequest = new UserRequest();
        userRequest.setName(user.getName());
        userRequest.setEmail(user.getEmail());
        userRequest.setPhone(user.getPhone());
        userRequest.setImageUrl(user.getImageUrl());
        userRequest.setGender(user.getGender());
        userRequest.setRole(user.getRole());
        return userRequest;
    }

    @PutMapping("/user/me")
    public User updateProfile(
            HttpServletRequest request,
            @RequestBody UserRequest userRequest) {
        String token = userService.extractToken(request);
        Long userId = jwtService.extractUserId(token);
        return userService.updateProfile(userId, userRequest);
    }

    @PutMapping("/user/changepassword")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {

        String token = userService.extractToken(httpRequest);
        Long userId = jwtService.extractUserId(token);
        userService.changePassword(userId, request);
        return ResponseEntity.ok("Change password success");
    }
}
