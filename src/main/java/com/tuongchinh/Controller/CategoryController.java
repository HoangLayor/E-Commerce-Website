package com.tuongchinh.Controller;

import com.tuongchinh.DTO.CategoryRequest;
import com.tuongchinh.DTO.CategoryResponse;
import com.tuongchinh.Service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/public/categories")
    public ResponseEntity<List<CategoryResponse>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    @PostMapping("/admin/categories")
    public ResponseEntity<String> create(@RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.create(request));
    }

    @DeleteMapping("/admin/categories/{id}")
    public ResponseEntity<String> delete(@PathVariable("id") Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok("Xóa danh mục thành công");
    }

    @PutMapping("/admin/categories/{id}")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable("id") Long id,
            @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }
}