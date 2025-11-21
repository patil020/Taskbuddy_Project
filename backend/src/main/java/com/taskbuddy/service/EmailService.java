package com.taskbuddy.service;

import org.springframework.beans.factory.annotation.Value;
// import org.springframework.mail.SimpleMailMessage;
// import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
// import lombok.RequiredArgsConstructor;

@Service
public class EmailService {
    
    @Value("${spring.mail.username:taskbuddy@example.com}")
    private String fromEmail;
    
    public void sendOTP(String toEmail, String otp) {
        // Console OTP for development (email disabled to prevent login issues)
        System.out.println("\n=== PASSWORD RESET OTP ===");
        System.out.println("Email: " + toEmail);
        System.out.println("OTP: " + otp);
        System.out.println("Expires in: 10 minutes");
        System.out.println("==========================\n");
    }
}