package com.tuongchinh.Controller;

import com.tuongchinh.DTO.PageResponseDTO;
import com.tuongchinh.Service.PageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/pages")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    @GetMapping("/{slug}")
    public ResponseEntity<PageResponseDTO> getPageLayout(@PathVariable String slug) {
        PageResponseDTO responseDTO = pageService.getPageLayoutBySlug(slug);
        return ResponseEntity.ok(responseDTO);
    }
}