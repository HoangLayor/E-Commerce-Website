package com.tuongchinh.Entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.BatchSize;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user")
@Getter
@Setter
@BatchSize(size = 100)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String password;
    private String role;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Cart cart;
    private String phone;
    private String imageUrl;
    private String gender; // male / female
    @Column(name = "is_active")
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean isActive = true;
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
}