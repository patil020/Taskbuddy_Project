package com.taskbuddy.repository;

import com.taskbuddy.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByEmailAndOtpAndUsedFalseAndExpiryTimeAfter(
        String email, String otp, LocalDateTime currentTime);
    
    void deleteByEmailAndUsedTrue(String email);
    
    void deleteByExpiryTimeBefore(LocalDateTime currentTime);
}