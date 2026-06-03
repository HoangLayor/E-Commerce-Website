package com.tuongchinh.Controller;

import com.tuongchinh.DTO.BrandResponse;
import com.tuongchinh.Repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/brands")
@RequiredArgsConstructor
@CrossOrigin
public class BrandController {

    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<List<BrandResponse>> getAll() {
        return ResponseEntity.ok(brandRepository.findAll().stream().map(brand -> {
            BrandResponse res = new BrandResponse();
            res.setId(brand.getId());
            res.setName(brand.getName());
            return res;
        }).toList());
    }
}
