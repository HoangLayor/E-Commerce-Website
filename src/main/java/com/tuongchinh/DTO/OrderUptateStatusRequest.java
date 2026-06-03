package com.tuongchinh.DTO;

import lombok.Data;

@Data
public class OrderUptateStatusRequest {
    private long id;
    private String status;
}
