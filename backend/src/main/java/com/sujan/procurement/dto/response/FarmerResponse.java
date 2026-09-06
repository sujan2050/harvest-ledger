package com.sujan.procurement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FarmerResponse {
    private Long id;
    private String fullName;
    private String aadharNumber;
    private String village;
    private String district;
    private String bankAccountNumber;
    private String ifscCode;
}