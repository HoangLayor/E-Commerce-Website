package com.tuongchinh.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReorderSectionRequest {
    private Long id;
    private Integer position;
}
