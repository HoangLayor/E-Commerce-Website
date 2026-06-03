package com.tuongchinh.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FlashSaleResponse {

    private Long id;

    private String name;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Boolean isActive;

    private List<FlashSaleProductResponse> products;
}