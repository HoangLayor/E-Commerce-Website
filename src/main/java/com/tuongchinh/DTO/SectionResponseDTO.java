package com.tuongchinh.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionResponseDTO {
    private Long id;
    private String type;
    private String title;
    private Integer position;
    private Map<String, Object> configJson;
    private Boolean active;
}
