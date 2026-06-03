package com.tuongchinh.DTO;

import lombok.Getter;
import lombok.Setter;
import java.util.Map;

@Getter
@Setter
public class PageSectionResponse {

    private Long id;

    private Long pageId;

    private String type;

    private String title;

    private Integer position;

    private Map<String, Object> configJson;

    private Boolean active;
}