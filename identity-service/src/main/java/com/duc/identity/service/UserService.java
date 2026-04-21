package com.duc.identity.service;

import com.duc.identity.constant.PredefinedRole;
import com.duc.identity.dto.request.UserCreationRequest;
import com.duc.identity.dto.response.UserResponse;
import com.duc.identity.entity.Role;
import com.duc.identity.entity.User;
import com.duc.identity.exception.AppException;
import com.duc.identity.exception.ErrorCode;
import com.duc.identity.mapper.UserMapper;
import com.duc.identity.repository.RoleRepository;
import com.duc.identity.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserMapper userMapper;
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;

    public UserResponse createUser(@Valid UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        HashSet<Role> roles = new HashSet<>();

        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        user.setRoles(roles);
        user.setEmailVerified(false);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        var userCreationReponse = userMapper.toUserResponse(user);
        return userCreationReponse;
    }

    public List<UserResponse> getUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> userResponses = users.stream().map(userMapper::toUserResponse).toList();
        return userResponses;
    }

    public UserResponse getUser(String userId) {
        String currentId = SecurityContextHolder.getContext().getAuthentication().getName();
        User targetUser  = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        User currentUser = userRepository.findById(currentId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (!currentId.equals(targetUser.getId()) && !currentUser.getRoles().stream().anyMatch(role -> role.getName().equals(PredefinedRole.ADMIN_ROLE)))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        return userMapper.toUserResponse(targetUser);
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }
}
