package com.tuongchinh.Service;

import com.tuongchinh.DTO.ChangePasswordRequest;
import com.tuongchinh.DTO.RegisterRequest;
import com.tuongchinh.DTO.UserRequest;
import com.tuongchinh.Entity.Cart;
import com.tuongchinh.Entity.User;
import com.tuongchinh.Repository.CartRepository;
import com.tuongchinh.Repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private com.tuongchinh.Repository.OrderRepository orderRepository;
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Sai mật khẩu");
        }
        return jwtService.generateToken(user.getId().toString());
    }
    private void checkTestCase(RegisterRequest request) {

        if (request == null) {
            throw new RuntimeException("Request không được null");
        }

        // name
        if (request.getName() == null
                || request.getName().trim().isEmpty()) {

            throw new RuntimeException("Tên không được để trống");
        }

        if (request.getName().length() > 100) {
            throw new RuntimeException("Tên quá dài");
        }

        // email
        if (request.getEmail() == null
                || request.getEmail().trim().isEmpty()) {

            throw new RuntimeException("Email không được để trống");
        }

        if (!request.getEmail().matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            throw new RuntimeException("Email không hợp lệ");
        }

        // password
        if (request.getPassword() == null
                || request.getPassword().isEmpty()) {

            throw new RuntimeException("Mật khẩu không được để trống");
        }

        // ít nhất 8 ký tự
        if (request.getPassword().length() < 8) {
            throw new RuntimeException("Mật khẩu phải từ 8 ký tự");
        }

        // regex password mạnh
        if (!request.getPassword().matches(
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$")) {

            throw new RuntimeException(
                    "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt");
        }

        // role
        List<String> validRoles = List.of("USER", "ADMIN");

        if (request.getRole() == null
                || !validRoles.contains(request.getRole())) {

            throw new RuntimeException("Role không hợp lệ");
        }
    }
    public String register(RegisterRequest request) {
        checkTestCase(request);
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email đã tồn tại";
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        Cart cart=new Cart();
        cart.setUser(user);
        userRepository.save(user);
        cartRepository.save(cart);
        return "Đăng ký thành công";
    }
    public User findByEmail(String email){
        return userRepository.findByEmail(email).orElse(null);
    }
    public User findById(Long id){
        return userRepository.findById(id).orElse(null);
    }
    public String extractToken(HttpServletRequest request) {

        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        throw new RuntimeException("Token not found in cookies");
    }
    public User updateProfile(Long userId, UserRequest request){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        return userRepository.save(user);
    }
    public void changePassword(Long userId, ChangePasswordRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Password confirmation not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }

    public java.util.List<User> findAllUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    public java.util.List<com.tuongchinh.DTO.CustomerResponse> getCustomersWithStats(String role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToCustomerResponse)
                .toList();
    }

    public com.tuongchinh.DTO.CustomerResponse getCustomerById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToCustomerResponse(user);
    }

    private com.tuongchinh.DTO.CustomerResponse mapToCustomerResponse(User user) {
        com.tuongchinh.DTO.CustomerResponse res = new com.tuongchinh.DTO.CustomerResponse();
        res.setId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setPhone(user.getPhone());
        res.setRole(user.getRole());
        res.setActive(user.isActive());
        res.setCreatedAt(user.getCreatedAt());
        
        long count = orderRepository.countByUserId(user.getId());
        java.math.BigDecimal total = orderRepository.sumTotalAmountByUserId(user.getId());
        
        res.setOrderCount(count);
        res.setTotalSpent(total != null ? total : java.math.BigDecimal.ZERO);
        
        return res;
    }

    public User toggleUserStatus(Long userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(isActive);
        return userRepository.save(user);
    }
}