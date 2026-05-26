package com.duc.identity.service;

import com.duc.identity.constant.PredefinedRole;
import com.duc.identity.dto.response.AuthResponse;
import com.duc.identity.entity.Role;
import com.duc.identity.entity.User;
import com.duc.identity.repository.RoleRepository;
import com.duc.identity.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GoogleOAuthService {

    UserRepository userRepository;
    RoleRepository roleRepository;

    RestTemplate restTemplate = new RestTemplate();

    @NonFinal
    @Value("${google.oauth.client-id}")
    String clientId;

    @NonFinal
    @Value("${google.oauth.client-secret}")
    String clientSecret;

    @NonFinal
    @Value("${google.oauth.redirect-uri}")
    String redirectUri;

    @NonFinal
    @Value("${jwt.signerKey}")
    String signerKey;

    @NonFinal
    @Value("${jwt.valid-duration}")
    long validDuration;

    private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

    /**
     * Full OAuth2 Authorization Code Flow:
     * 1. Exchange authorization code → Google access_token
     * 2. Fetch user info from Google
     * 3. Upsert user in our DB
     * 4. Generate and return internal JWT
     */
    public AuthResponse authenticateWithGoogle(String authorizationCode) {
        String accessToken = exchangeCodeForToken(authorizationCode);
        Map<String, Object> userInfo = fetchUserInfo(accessToken);

        String email = (String) userInfo.get("email");
        String firstName = (String) userInfo.getOrDefault("given_name", "");
        String lastName = (String) userInfo.getOrDefault("family_name", "");

        User user = upsertUser(email, firstName, lastName);
        String jwtToken = generateToken(user);

        return AuthResponse.builder().token(jwtToken).build();
    }

    /**
     * Step 1: Exchange authorization code for Google access_token
     */
    @SuppressWarnings("unchecked")
    private String exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(TOKEN_ENDPOINT, request, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("Failed to exchange code for token. Status: {}", response.getStatusCode());
            throw new RuntimeException("Failed to exchange Google authorization code");
        }

        String accessToken = (String) response.getBody().get("access_token");
        if (accessToken == null) {
            log.error("No access_token in Google response: {}", response.getBody());
            throw new RuntimeException("No access_token returned by Google");
        }

        return accessToken;
    }

    /**
     * Step 2: Fetch user profile from Google UserInfo endpoint
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(USERINFO_ENDPOINT, HttpMethod.GET, request, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("Failed to fetch user info from Google. Status: {}", response.getStatusCode());
            throw new RuntimeException("Failed to fetch user info from Google");
        }

        return response.getBody();
    }

    /**
     * Step 3: Upsert — create new user if not found, update if email exists
     */
    private User upsertUser(String email, String firstName, String lastName) {
        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    // Update display name in case it changed
                    existingUser.setFirstName(firstName);
                    existingUser.setLastName(lastName);
                    existingUser.setEmailVerified(true);
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    Role userRole = roleRepository.findById(PredefinedRole.USER_ROLE)
                            .orElseGet(() -> Role.builder()
                                    .name(PredefinedRole.USER_ROLE)
                                    .description("User role")
                                    .build());

                    User newUser = User.builder()
                            .email(email)
                            .firstName(firstName)
                            .lastName(lastName)
                            .emailVerified(true)
                            .roles(new HashSet<>(Set.of(userRole)))
                            .build();

                    log.info("Creating new user from Google OAuth: {}", email);
                    return userRepository.save(newUser);
                });
    }

    /**
     * Step 4: Generate internal JWT — replicates AuthService.generateToken logic
     */
    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer("fpt.com")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(validDuration, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .claim("email", user.getEmail())
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot sign JWT for Google OAuth user", e);
            throw new RuntimeException("Failed to generate token", e);
        }
    }

    private String buildScope(User user) {
        StringJoiner joiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> joiner.add("ROLE_" + role.getName()));
        }
        return joiner.toString();
    }
}
