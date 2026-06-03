package com.tuongchinh.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateFlashSaleRequest {

    private String name;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
