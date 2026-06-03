package com.tuongchinh.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "brand")
public class Brand {
    @Id
    @GeneratedValue
    private Long id;

    private String name;
}
