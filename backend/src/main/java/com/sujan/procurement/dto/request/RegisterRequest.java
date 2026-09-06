package com.sujan.procurement.dto.request;

import com.sujan.procurement.enums.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;


    private String phone;

    private Role role;

    // Only required when role = FARMER
    private String fullName;
    private String aadharNumber;
    private String village;
    private String district;
    private String bankAccountNumber;
    private String ifscCode;
}
