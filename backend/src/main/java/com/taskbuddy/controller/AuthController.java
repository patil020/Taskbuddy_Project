package com.taskbuddy.controller;

import com.taskbuddy.dto.*;
import com.taskbuddy.entity.User;
import com.taskbuddy.security.JwtService;
import com.taskbuddy.service.UserService;
import com.taskbuddy.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication operations
 * Handles user registration and login
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"})
@AllArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final PasswordResetService passwordResetService;

   
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        ApiResponse<UserDto> response = userService.registerUser(registerRequest);
        return ResponseEntity.ok(response);
    }

  
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        // Authenticate user
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), 
                loginRequest.getPassword()
            )
        );
        
        // Load user details and generate token
        UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
        String token = jwtService.generateToken(userDetails);
        
        // Get user information for response
        User user = (User) userDetails;
        AuthResponseDTO authResponse = new AuthResponseDTO(
            token,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name()
        );
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful!", authResponse));
    }

  
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@org.springframework.security.core.annotation.AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setEmail(user.getEmail());
    userDto.setRole(user.getRole().name());
        return ResponseEntity.ok(new ApiResponse<>(true, "User retrieved successfully", userDto));
    }

   
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        ApiResponse<String> response = passwordResetService.requestPasswordReset(request);
        return ResponseEntity.ok(response);
    }

    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        ApiResponse<String> response = passwordResetService.resetPassword(request);
        return ResponseEntity.ok(response);
    }


}
