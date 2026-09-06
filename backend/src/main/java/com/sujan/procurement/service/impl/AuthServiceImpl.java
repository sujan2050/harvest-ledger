package com.sujan.procurement.service.impl;

import com.sujan.procurement.dto.request.LoginRequest;
import com.sujan.procurement.dto.request.RegisterRequest;
import com.sujan.procurement.dto.response.AuthResponse;
import com.sujan.procurement.entity.Farmer;
import com.sujan.procurement.entity.User;
import com.sujan.procurement.enums.Role;
import com.sujan.procurement.repository.FarmerRepository;
import com.sujan.procurement.repository.UserRepository;
import com.sujan.procurement.security.CustomUserDetails;
import com.sujan.procurement.security.JwtUtil;
import com.sujan.procurement.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() == null ? Role.FARMER : request.getRole());
        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.FARMER) {
            Farmer farmer = new Farmer();
            farmer.setUser(savedUser);
            farmer.setFullName(request.getFullName());
            farmer.setAadharNumber(request.getAadharNumber());
            farmer.setVillage(request.getVillage());
            farmer.setDistrict(request.getDistrict());
            farmer.setBankAccountNumber(request.getBankAccountNumber());
            farmer.setIfscCode(request.getIfscCode());
            farmerRepository.save(farmer);
        }

        String token = jwtUtil.generateToken(new CustomUserDetails(savedUser));
        return new AuthResponse(token, savedUser.getUsername(), savedUser.getRole().name());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        String token = jwtUtil.generateToken(new CustomUserDetails(user));
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }
}
