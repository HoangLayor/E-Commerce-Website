package com.tuongchinh.DTO;

import lombok.Data;
import java.util.List;

@Data
public class AttributeResponse {
    private Long id;
    private String name;
    private List<AttributeValueResponse> values;

    @Data
    public static class AttributeValueResponse {
        private Long id;
        private String value;
    }
}
