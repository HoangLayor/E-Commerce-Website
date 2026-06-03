package com.tuongchinh.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BannerItemResponse {

    private Long id;

    private String imageUrl;

    private String redirectUrl;

    private Integer position;

    private Boolean active;
}
