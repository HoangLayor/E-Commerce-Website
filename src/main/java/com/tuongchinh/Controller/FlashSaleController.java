package com.tuongchinh.Controller;

import com.tuongchinh.DTO.AddFlashSaleVariantRequest;
import com.tuongchinh.DTO.CreateFlashSaleRequest;
import com.tuongchinh.DTO.FlashSaleResponse;
import com.tuongchinh.Entity.FlashSale;
import com.tuongchinh.Entity.FlashSaleProduct;
import com.tuongchinh.Service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class FlashSaleController {
        private final FlashSaleService flashSaleService;

        @PostMapping("/admin/flashsale/create")
        public FlashSale createFlashSale(
                        @RequestBody CreateFlashSaleRequest request) {

                return flashSaleService
                                .createFlashSale(request);
        }

        @PostMapping("/admin/flashsale/{flashSaleId}")
        public String addFlashSaleVariant(
                        @PathVariable Long flashSaleId,
                        @RequestBody AddFlashSaleVariantRequest request) {

                flashSaleService.addFlashSaleVariant(
                                flashSaleId,
                                request);

                return "Add flash sale variant successfully";
        }

        @GetMapping("public/flashsale/active")
        public List<FlashSaleResponse> getActiveFlashSales() {
                return flashSaleService.getActiveFlashSales();
        }

        @GetMapping("admin/flashsale/all")
        public List<FlashSaleResponse> getAllFlashSales() {
                return flashSaleService.getAllFlashSales();
        }

        @PutMapping("/admin/flashsale/toggle/{flashSaleId}")
        public FlashSaleResponse toggleFlashSale(
                        @PathVariable Long flashSaleId) {

                return flashSaleService.toggleFlashSaleStatus(
                                flashSaleId);
        }
        @PutMapping("/admin/flashsale/update/{flashSaleId}")
        public FlashSaleResponse update(
                @PathVariable Long flashSaleId,
                @RequestBody CreateFlashSaleRequest request
        ) {
                return flashSaleService.updateFlashSale(
                        flashSaleId,
                        request
                );
        }
}
