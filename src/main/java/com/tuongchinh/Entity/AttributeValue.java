package com.tuongchinh.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.BatchSize;

@Entity
@Table(name = "attribute_value")
@Getter
@Setter
@BatchSize(size = 100)
public class AttributeValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "attribute_id")
    private Attribute attribute;
    private String value;
}
