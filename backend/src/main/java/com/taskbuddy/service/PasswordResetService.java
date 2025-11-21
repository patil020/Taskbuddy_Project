package com.taskbuddy.service;

import com.taskbuddy.dto.*;
import com.taskbuddy.entity.*;
import com.taskbuddy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetService {
    
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    public ApiResponse<String> requestPasswordReset(ForgotPasswordRequestDTO request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
            
            // Generate 6-digit OTP
            String otp = String.format("%06d", new Random().nextInt(999999));
            
            // Save OTP token
            PasswordResetToken token = new PasswordResetToken();
            token.setEmail(request.getEmail());
            token.setOtp(otp);
            token.setExpiryTime(LocalDateTime.now().plusMinutes(10));
            tokenRepository.save(token);
            
            // Send OTP via email (development mode - logs to console)
            emailService.sendOTP(request.getEmail(), otp);
            
            return new ApiResponse<>(true, "OTP sent to your email (check console in development)", null);
        } catch (Exception e) {
            System.err.println("Error in password reset request: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to process password reset request: " + e.getMessage(), null);
        }
    }
    
    public ApiResponse<String> resetPassword(ResetPasswordRequestDTO request) {
        try {
            // Validate OTP
            PasswordResetToken token = tokenRepository
                .findByEmailAndOtpAndUsedFalseAndExpiryTimeAfter(
                    request.getEmail(), request.getOtp(), LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));
            
            // Update user password
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            // Mark token as used
            token.setUsed(true);
            tokenRepository.save(token);
            
            return new ApiResponse<>(true, "Password reset successfully", null);
        } catch (Exception e) {
            System.err.println("Error in password reset: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to reset password: " + e.getMessage(), null);
        }
    }
}