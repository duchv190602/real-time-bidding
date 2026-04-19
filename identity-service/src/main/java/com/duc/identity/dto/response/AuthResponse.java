package com.duc.identity.dto.response;

public record AuthResponse(String accessToken, UserResponse user) {
}
