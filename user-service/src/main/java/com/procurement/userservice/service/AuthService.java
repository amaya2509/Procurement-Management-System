package com.procurement.userservice.service;

import com.procurement.userservice.dto.AuthResponse;
import com.procurement.userservice.dto.LoginRequest;
import com.procurement.userservice.model.Role;
import com.procurement.userservice.model.User;
import com.procurement.userservice.repository.RoleRepository;
import com.procurement.userservice.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final AuthenticationManager authenticationManager;

        // Hardcoded for assignment context ONLY
        private static final String SECRET_KEY = "ProcurementSystemSecretKeyForJWTGenerationThatIsLongEnoughToMatchAlgorithmRequirements2025";

        public AuthResponse login(LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));

                User user = userRepository.findByUsername(request.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Role role = roleRepository.findById(user.getRoleId())
                                .orElseThrow(() -> new RuntimeException("Role not found"));

                Map<String, Object> extraClaims = new HashMap<>();
                extraClaims.put("role", role.getRoleName());
                extraClaims.put("userId", user.getId());

                String jwtToken = generateToken(extraClaims, user.getUsername());

                return AuthResponse.builder()
                                .token(jwtToken)
                                .username(user.getUsername())
                                .role(role.getRoleName())
                                .build();
        }

        private String generateToken(Map<String, Object> extraClaims, String subject) {
                return Jwts.builder()
                                .setClaims(extraClaims)
                                .setSubject(subject)
                                .setIssuedAt(new Date(System.currentTimeMillis()))
                                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hours
                                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                                .compact();
        }

        private Key getSignInKey() {
                byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
                return Keys.hmacShaKeyFor(keyBytes);
        }
}
