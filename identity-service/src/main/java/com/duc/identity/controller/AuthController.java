package com.duc.identity.controller;

import com.duc.common.dto.response.ApiResponse;
import com.duc.identity.dto.request.AuthenticationRequest;
import com.duc.identity.dto.request.GoogleAuthRequest;
import com.duc.identity.dto.request.IntrospectRequest;
import com.duc.identity.dto.request.LogoutRequest;
import com.duc.identity.dto.response.AuthResponse;
import com.duc.identity.dto.response.IntrospectResponse;
import com.duc.identity.service.AuthService;
import com.duc.identity.service.GoogleOAuthService;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
    AuthService authService;
    GoogleOAuthService googleOAuthService;

    // Login with username/password
    @PostMapping("/token")
    ApiResponse<AuthResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authService.authenticate(request);
        return ApiResponse.<AuthResponse>builder().result(result).build();
    }

    // Login with Google OAuth2 — receives authorization code from frontend
    @PostMapping("/google")
    ApiResponse<AuthResponse> authenticateWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        var result = googleOAuthService.authenticateWithGoogle(request.getCode());
        return ApiResponse.<AuthResponse>builder().result(result).build();
    }

    // Verify token
    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request) throws ParseException {
        var result = authService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    // Logout
    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authService.logout(request);
        return ApiResponse.<Void>builder().build();
    }
}

