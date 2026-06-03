package com.tuongchinh.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SectionResponse {

    private Long id;

    private String type;

    private String title;

    private Integer position;

    private Object data;
}