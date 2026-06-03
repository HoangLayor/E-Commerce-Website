package com.tuongchinh.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PageResponse {
    private Long id;
    private String name;
    private String slug;
    private List<SectionResponse> sections;
}