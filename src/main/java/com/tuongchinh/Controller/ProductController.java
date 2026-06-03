package com.tuongchinh.Controller;

import com.tuongchinh.DTO.*;
import com.tuongchinh.Entity.ProductVariant;
import com.tuongchinh.Service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin
public class ProductController {

    private final ProductService productService;
    private final com.tuongchinh.Service.ProductImportExportService productImportExportService;

    @GetMapping("/public/product")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<Long> brandIds,
            @RequestParam(required = false) List<Long> attributeValueIds,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(
                productService.searchProducts(
                        keyword, minPrice, maxPrice,
                        categoryIds, brandIds, inStock, attributeValueIds,
                        page, size, sortBy, sortDir));
    }

    @GetMapping("/public/product/{id}")
    public ResponseEntity<ProductResponse> getProductDetail(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

    @GetMapping("/public/product/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategoryId(categoryId));
    }

    @GetMapping("/public/product/new")
    public ResponseEntity<List<ProductResponse>> getNewProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(productService.getNewProducts(limit));
    }

    // =====================
    // ADMIN
    // =====================

    @PostMapping(value = "/admin/product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> create(
            @RequestPart("product") ProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(productService.create(request, images));
    }

    @PutMapping(value = "/admin/product/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @RequestPart("product") ProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(productService.update(id, request, images));
    }

    @DeleteMapping("/admin/product/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public/products/sale")
    public ResponseEntity<Page<ProductResponse>> getSaleProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.getSaleProducts(page, size));
    }

    // ADMIN: Set giá sale cho variant
    @PutMapping("/admin/variants/sale")
    public ResponseEntity<SaleResponse> setSalePrice(@RequestBody SaleRequest request) {
        ProductVariant variant = productService.setSalePrice(request);
        return ResponseEntity.ok(productService.buildSaleResponse(variant));
    }

    // ADMIN: Bỏ sale cho variant
    @DeleteMapping("/admin/variants/{variantId}/sale")
    public ResponseEntity<Void> removeSale(@PathVariable Long variantId) {
        productService.removeSale(variantId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("public/product/best-sellers")
    public ResponseEntity<List<ProductResponse>> getBestSelling(
            @RequestParam(defaultValue = "10") int limit) {
        List<ProductResponse> result = productService.getBestSelling(limit);
        return ResponseEntity.ok(result);
    }

    @GetMapping("public/product/flash-sale")
    public ResponseEntity<List<ProductResponse>> getFlashSale(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(productService.getFlashSale(limit));
    }

    // ADMIN: Export sản phẩm ra file Excel
    @GetMapping("/admin/product/export")
    public ResponseEntity<Void> exportProducts(jakarta.servlet.http.HttpServletResponse response) {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=products.xlsx");
        try {
            productImportExportService.exportToExcel(response.getOutputStream());
            response.flushBuffer();
            return ResponseEntity.ok().build();
        } catch (java.io.IOException e) {
            throw new RuntimeException("Không thể xuất file Excel", e);
        }
    }

    // ADMIN: Import sản phẩm từ file Excel
    @PostMapping(value = "/admin/product/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> importProducts(@RequestParam("file") MultipartFile file) {
        try {
            productImportExportService.importFromExcel(file.getInputStream());
            return ResponseEntity.ok("Import sản phẩm thành công!");
        } catch (java.io.IOException e) {
            return ResponseEntity.badRequest().body("Lỗi khi đọc file Excel: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xử lý dữ liệu: " + e.getMessage());
        }
    }
}