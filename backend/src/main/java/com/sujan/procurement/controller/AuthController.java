package com.sujan.procurement.controller;

import com.sujan.procurement.dto.request.LoginRequest;
import com.sujan.procurement.dto.request.RegisterRequest;
import com.sujan.procurement.dto.response.AuthResponse;
import com.sujan.procurement.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
