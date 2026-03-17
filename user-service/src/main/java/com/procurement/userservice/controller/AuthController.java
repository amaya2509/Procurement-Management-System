package com.procurement.userservice.controller;

import com.procurement.common.dto.CommonResponse;
import com.procurement.userservice.dto.AuthResponse;
import com.procurement.userservice.dto.LoginRequest;
import com.procurement.userservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<CommonResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(CommonResponse.success(response, "Login successful"));
    }
}
