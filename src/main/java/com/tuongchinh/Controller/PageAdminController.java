package com.tuongchinh.Controller;

import com.tuongchinh.DTO.PageSummaryDTO;
import com.tuongchinh.Service.PageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tuongchinh.DTO.CreatePageRequest;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pages")
@RequiredArgsConstructor
public class PageAdminController {

    private final PageService pageService;

    @GetMapping
    public ResponseEntity<List<PageSummaryDTO>> getAllPages() {
        return ResponseEntity.ok(pageService.getAllPages());
    }

    @PostMapping
    public ResponseEntity<PageSummaryDTO> createPage(@RequestBody CreatePageRequest request) {
        return ResponseEntity.ok(pageService.createPage(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PageSummaryDTO> updatePage(@PathVariable Long id, @RequestBody CreatePageRequest request) {
        return ResponseEntity.ok(pageService.updatePage(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePage(@PathVariable Long id) {
        pageService.deletePage(id);
        return ResponseEntity.ok("Page deleted successfully");
    }
}
