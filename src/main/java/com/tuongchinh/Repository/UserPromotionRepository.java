package com.tuongchinh.Repository;

import com.tuongchinh.Entity.Promotion;
import com.tuongchinh.Entity.User;
import com.tuongchinh.Entity.UserPromotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPromotionRepository extends JpaRepository<UserPromotion, Long> {
    List<UserPromotion> findByUser(User user);
    
    Optional<UserPromotion> findByUserAndPromotion(User user, Promotion promotion);
    
    List<UserPromotion> findByUserAndIsUsedFalse(User user);
}
