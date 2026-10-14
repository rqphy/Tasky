package com.tasky.auth;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;

import com.tasky.auth.dto.RegisterRequest;
import com.tasky.auth.dto.RegisterResponse;
import com.tasky.user.User;
import com.tasky.user.UserRepository;
import com.tasky.user.UserResponse;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthService(
        UserRepository users,
        RefreshTokenRepository refreshTokens,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        JwtProperties jwtProperties
    ) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new EmailAlreadyRegisteredException();
        }

        User user = users.save(new User(
            request.name(),
            request.email(),
            passwordEncoder.encode(request.password())
        ));

        String accessToken = jwtService.generateAccessToken(user.getId());
        String refreshToken = createRefreshToken(user.getId());

        return new RegisterResponse(UserResponse.from(user), accessToken, refreshToken);
    }

    private String createRefreshToken(String userId) {
        byte[] bytes = new byte[64];
        RANDOM.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        Instant expiresAt = Instant.now().plus(jwtProperties.refreshTokenExpiry());
        refreshTokens.save(new RefreshToken(token, userId, expiresAt));
        return token;
    }
}
