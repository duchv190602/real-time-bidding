package com.duc.identity.dto.response;

import java.util.Set;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        String provider,
        Set<String> roles
) {
}
