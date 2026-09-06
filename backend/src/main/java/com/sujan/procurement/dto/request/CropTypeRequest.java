package com.sujan.procurement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CropTypeRequest {
    @NotBlank
    private String name;
    private String category;
    private String unit;
    private BigDecimal basePrice;
    private BigDecimal mspPrice;
}
