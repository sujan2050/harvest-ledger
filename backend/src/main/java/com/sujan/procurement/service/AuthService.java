package com.sujan.procurement.service;

import com.sujan.procurement.dto.request.LoginRequest;
import com.sujan.procurement.dto.request.RegisterRequest;
import com.sujan.procurement.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
