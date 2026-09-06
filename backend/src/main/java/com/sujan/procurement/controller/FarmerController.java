package com.sujan.procurement.controller;

import com.sujan.procurement.dto.response.FarmerResponse;
import com.sujan.procurement.entity.Farmer;
import com.sujan.procurement.entity.User;
import com.sujan.procurement.exception.ResourceNotFoundException;
import com.sujan.procurement.repository.FarmerRepository;
import com.sujan.procurement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmers")
@RequiredArgsConstructor
public class FarmerController {

    private final FarmerRepository farmerRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public FarmerResponse getMyProfile(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Farmer farmer = farmerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));

        return new FarmerResponse(
                farmer.getId(),
                farmer.getFullName(),
                farmer.getAadharNumber(),
                farmer.getVillage(),
                farmer.getDistrict(),
                farmer.getBankAccountNumber(),
                farmer.getIfscCode()
        );
    }
}