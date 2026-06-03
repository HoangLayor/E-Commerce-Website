package com.tuongchinh.Controller;

import com.tuongchinh.DTO.AttributeResponse;
import com.tuongchinh.Service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/attributes")
@RequiredArgsConstructor
public class AttributeController {
    private final AttributeService attributeService;

    @GetMapping
    public List<AttributeResponse> getAllAttributes() {
        return attributeService.getAllAttributes();
    }
}
