package com.duc.identity.service;

import com.duc.identity.configuration.JwtTokenProvider;
import com.duc.identity.dto.request.LoginRequest;
import com.duc.identity.dto.request.RegisterRequest;
import com.duc.identity.dto.response.AuthResponse;
import com.duc.identity.entity.AuthProvider;
import com.duc.identity.entity.User;
import com.duc.identity.exception.DuplicateEmailException;
import com.duc.identity.exception.InvalidCredentialsException;
import com.duc.identity.mapper.UserMapper;
import com.duc.identity.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userMapper = userMapper;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException(request.email());
        }

        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setAuthProvider(AuthProvider.LOCAL);
        user.getRoles().add("ROLE_USER");

        User savedUser = userRepository.save(user);
        return new AuthResponse(jwtTokenProvider.generateToken(savedUser), userMapper.toResponse(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new InvalidCredentialsException();
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return new AuthResponse(jwtTokenProvider.generateToken(user), userMapper.toResponse(user));
    }

    @Transactional
    public AuthResponse issueTokenForSocialUser(User user) {
        User savedUser = userRepository.findByEmail(user.getEmail())
                .map(existing -> mergeSocialUser(existing, user))
                .map(userRepository::save)
                .orElseGet(() -> userRepository.save(user));

        return new AuthResponse(jwtTokenProvider.generateToken(savedUser), userMapper.toResponse(savedUser));
    }

    private User mergeSocialUser(User existing, User candidate) {
        existing.setFullName(candidate.getFullName());
        existing.setAuthProvider(candidate.getAuthProvider());
        existing.setEnabled(true);
        if (existing.getRoles().isEmpty()) {
            existing.getRoles().add("ROLE_USER");
        }
        return existing;
    }
}
