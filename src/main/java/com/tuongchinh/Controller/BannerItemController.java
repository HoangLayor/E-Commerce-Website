package com.tuongchinh.Controller;

import com.tuongchinh.DTO.CreateBannerItemRequest;
import com.tuongchinh.Service.BannerItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/banneritems")
@RequiredArgsConstructor
public class BannerItemController {

    private final BannerItemService bannerItemService;

    // =========================================
    // CREATE
    // =========================================
    @PostMapping
    public ResponseEntity<?> create(
            @ModelAttribute CreateBannerItemRequest req
    ) {

        return ResponseEntity.ok(
                bannerItemService.create(req)
        );
    }

    @GetMapping("/banner/{bannerId}")
    public ResponseEntity<?> getByBanner(
            @PathVariable Long bannerId
    ) {

        return ResponseEntity.ok(
                bannerItemService.getByBanner(bannerId)
        );
    }

    // =========================================
    // GET DETAIL
    // =========================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                bannerItemService.getDetail(id)
        );
    }

    // =========================================
    // UPDATE
    // =========================================

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @ModelAttribute CreateBannerItemRequest req
    ) {

        return ResponseEntity.ok(
                bannerItemService.update(id, req)
        );
    }

    // =========================================
    // DELETE
    // =========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {

        bannerItemService.delete(id);

        return ResponseEntity.ok("Deleted");
    }
}