package com.tasky.auth;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;

import com.tasky.auth.dto.LoginRequest;
import com.tasky.auth.dto.LoginResponse;
import com.tasky.auth.dto.RegisterRequest;
import com.tasky.auth.dto.RegisterResponse;
import com.tasky.auth.dto.RefreshRequest;
import com.tasky.auth.dto.RefreshResponse;
import com.tasky.auth.dto.LogoutRequest;
import com.tasky.auth.dto.LogoutResponse;
import com.tasky.auth.dto.ForgotPasswordRequest;
import com.tasky.auth.dto.ForgotPasswordResponse;

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
    private final PasswordResetTokenRepository passwordResetTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthService(
        UserRepository users,
        RefreshTokenRepository refreshTokens,
        PasswordResetTokenRepository passwordResetTokens,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        JwtProperties jwtProperties
    ) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.passwordResetTokens = passwordResetTokens;
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

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = users.findByEmail(request.email())
            .filter(found -> !found.getEmail().endsWith("@deleted.tasky"))
            .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        return new LoginResponse(
            UserResponse.from(user),
            jwtService.generateAccessToken(user.getId()),
            createRefreshToken(user.getId())
        );
    }

    @Transactional(noRollbackFor = ExpiredRefreshTokenException.class)
    public RefreshResponse refresh(RefreshRequest request) {
        if (request.refreshToken() == null || request.refreshToken().isBlank()) {
            throw new RefreshTokenRequiredException();
        }

        RefreshToken storedToken = refreshTokens.findByToken(request.refreshToken())
            .orElseThrow(InvalidRefreshTokenException::new);

        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokens.delete(storedToken);
            throw new ExpiredRefreshTokenException();
        }

        refreshTokens.delete(storedToken);

        return new RefreshResponse(
            jwtService.generateAccessToken(storedToken.getUserId()),
            createRefreshToken(storedToken.getUserId())
        );
    }

    @Transactional
    public LogoutResponse logout(LogoutRequest request) {
        if (request.refreshToken() == null || request.refreshToken().isBlank()) {
            throw new RefreshTokenRequiredException();
        }

        RefreshToken storedToken = refreshTokens.findByToken(request.refreshToken())
            .orElseThrow(UnknownLogoutTokenException::new);

        refreshTokens.delete(storedToken);

        return new LogoutResponse("Logged out successfully");
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        users.findByEmail(request.email())
            .filter(found -> !found.getEmail().endsWith("@deleted.tasky"))
            .ifPresent(this::createPasswordResetToken);

        return new ForgotPasswordResponse("If an account exists for that email, a reset link has been sent.");
    }

    private void createPasswordResetToken(User user) {
        passwordResetTokens.deleteByUserId(user.getId());

        byte[] bytes = new byte[64];
        RANDOM.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        Instant expiresAt = Instant.now().plus(jwtProperties.passwordResetTokenExpiry());
        passwordResetTokens.save(new PasswordResetToken(token, user.getId(), expiresAt));

        // TODO: Send reset link to email
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
