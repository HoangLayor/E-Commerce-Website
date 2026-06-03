package com.tuongchinh.Repository;

import com.tuongchinh.Entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    
    @EntityGraph(attributePaths = {"cart"})
    java.util.List<User> findByRole(String role);

    long countByRole(String role);
}
