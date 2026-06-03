package com.tuongchinh.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "banner_items")
@Getter
@Setter
public class BannerItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "banner_id")
    private Banner banner;
    private String imageUrl;
    private Integer position;
    private Boolean active = true;
}
