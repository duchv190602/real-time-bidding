package com.duc.identity.mapper;

import com.duc.identity.dto.response.UserResponse;
import com.duc.identity.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getAuthProvider().name(),
                user.getRoles()
        );
    }
}
