package com.duc.identity.service;

import com.duc.identity.entity.AuthProvider;
import com.duc.identity.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class GoogleOAuth2Service {
    private final RestClient restClient;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;

    public GoogleOAuth2Service(
            RestClient.Builder restClientBuilder,
            @Value("${google.oauth.client-id:}") String clientId,
            @Value("${google.oauth.client-secret:}") String clientSecret,
            @Value("${google.oauth.redirect-uri:http://localhost:8081/api/v1/auth/oauth2/callback}") String redirectUri
    ) {
        this.restClient = restClientBuilder.build();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
    }

    public User fetchUser(String code) {
        LinkedMultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");

        Map<String, Object> tokenResponse = restClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        String accessToken = tokenResponse == null ? null : String.valueOf(tokenResponse.get("access_token"));

        Map<String, Object> userInfo = restClient.get()
                .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .body(Map.class);

        User user = new User();
        user.setEmail(String.valueOf(userInfo.get("email")));
        user.setFullName(String.valueOf(userInfo.getOrDefault("name", userInfo.get("email"))));
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.getRoles().add("ROLE_USER");
        return user;
    }
}
