package com.tuongchinh.Controller;

import com.tuongchinh.DTO.CreateBannerRequest;
import com.tuongchinh.Service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("api/")
@RequiredArgsConstructor
public class BannerController {
    private final BannerService bannerService;
    @PostMapping("admin/banner/create")
    public ResponseEntity<?> create(
            @RequestBody CreateBannerRequest req
    ) {
        return ResponseEntity.ok(
                bannerService.create(req)
        );
    }
    @GetMapping("admin/banner/all")
    public ResponseEntity<?> getAll() {

        return ResponseEntity.ok(
                bannerService.getAll()
        );
    }
    @PutMapping("admin/banner/update/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody CreateBannerRequest req
    ) {

        return ResponseEntity.ok(
                bannerService.update(id, req)
        );
    }
    @DeleteMapping("admin/banner/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {

        bannerService.delete(id);

        return ResponseEntity.ok("Deleted");
    }
    @PutMapping("admin/banner/set_active/{id}")
    public ResponseEntity<?> setActive(@PathVariable Long id){
        return ResponseEntity.ok(
                bannerService.setActive(id)
        );
    }
}
