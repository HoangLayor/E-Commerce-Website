package com.tuongchinh.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageSummaryDTO {
    private Long id;
    private String name;
    private String slug;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
