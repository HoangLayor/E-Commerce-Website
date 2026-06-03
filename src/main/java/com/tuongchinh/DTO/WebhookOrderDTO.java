package com.tuongchinh.DTO;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class WebhookOrderDTO {
    private String order_id;
    private String user_id;
    private BigDecimal total;
    private String payment_method;
    private Object created_at;
}
