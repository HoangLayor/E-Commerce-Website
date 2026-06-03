package com.tuongchinh.Controller;

import com.tuongchinh.DTO.*;
import com.tuongchinh.Service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class VoucherController {
    private final VoucherService voucherService;
    @GetMapping("/api/public/vouchers")
    public ResponseEntity<List<VoucherResponse>> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getActiveVouchers());
    }

    @PostMapping("/api/vouchers/apply")
    public ResponseEntity<VoucherApplyResponse> applyVoucher(
            @RequestBody VoucherApplyRequest request) {
        return ResponseEntity.ok(voucherService.applyVoucher(request));
    }

    @GetMapping("/api/admin/vouchers")
    public ResponseEntity<List<VoucherResponse>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @PostMapping("/api/admin/vouchers")
    public ResponseEntity<VoucherResponse> create(
            @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.create(request));
    }

    @PutMapping("/api/admin/vouchers/{id}")
    public ResponseEntity<VoucherResponse> update(
            @PathVariable Long id,
            @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.update(id, request));
    }

    @DeleteMapping("/api/admin/vouchers/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        voucherService.delete(id);
        return ResponseEntity.ok().build();
    }
}