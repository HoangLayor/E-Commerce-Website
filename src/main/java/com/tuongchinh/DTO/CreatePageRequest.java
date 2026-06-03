package com.tuongchinh.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePageRequest {

    private String name;

    private String slug;
    
    private Boolean active;
}
