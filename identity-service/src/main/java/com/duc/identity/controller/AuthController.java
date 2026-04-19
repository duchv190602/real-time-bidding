package com.duc.identity.controller;

import com.duc.common.dto.response.ApiResponse;
import com.duc.identity.dto.request.GoogleCallbackRequest;
import com.duc.identity.dto.request.LoginRequest;
import com.duc.identity.dto.request.RegisterRequest;
import com.duc.identity.dto.response.AuthResponse;
import com.duc.identity.entity.User;
import com.duc.identity.service.AuthService;
import com.duc.identity.service.GoogleOAuth2Service;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final GoogleOAuth2Service googleOAuth2Service;

    public AuthController(AuthService authService, GoogleOAuth2Service googleOAuth2Service) {
        this.authService = authService;
        this.googleOAuth2Service = googleOAuth2Service;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/oauth2/callback")
    public ApiResponse<AuthResponse> oauth2Callback(@Valid @RequestBody GoogleCallbackRequest request) {
        User googleUser = googleOAuth2Service.fetchUser(request.code());
        return ApiResponse.ok(authService.issueTokenForSocialUser(googleUser));
    }
}
