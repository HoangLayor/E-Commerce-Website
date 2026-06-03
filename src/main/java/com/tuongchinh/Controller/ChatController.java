package com.tuongchinh.Controller;

import com.tuongchinh.DTO.ChatRequest;
import com.tuongchinh.DTO.ChatResponse;
import com.tuongchinh.Entity.ChatMessage;
import com.tuongchinh.Entity.User;
import com.tuongchinh.Repository.ChatMessageRepository;
import com.tuongchinh.Service.ChatService;
import com.tuongchinh.Service.JwtService;
import com.tuongchinh.Service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;
    private final JwtService jwtService;
    private final ChatMessageRepository chatMessageRepository;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest chatRequest,
            HttpServletRequest request) {
        
        String token = userService.extractToken(request);
        User user = null;
        if (token != null) {
            Long userId = jwtService.extractUserId(token);
            user = userService.findById(userId);
        }

        if (user == null) {
            String hardcodedMsg = "Cảm ơn bạn đã quan tâm đến GlowSkin! 👋 Để được tư vấn chi tiết hơn bằng AI và xem lại lịch sử trò chuyện, bạn vui lòng **Đăng nhập** nhé. \n\nHôm nay bạn cần tìm sản phẩm nào không?";
            return ResponseEntity.ok(new ChatResponse(hardcodedMsg));
        }

        ChatResponse response = chatService.getResponse(user, chatRequest, token);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getHistory(HttpServletRequest request) {
        String token = userService.extractToken(request);
        if (token == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = jwtService.extractUserId(token);
        
        List<ChatMessage> history = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
        return ResponseEntity.ok(history);
    }
}
