package com.sujan.procurement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TokenGenerateRequest {
    @NotNull
    private Long centerId;
    @NotNull
    private Long cropTypeId;
    private BigDecimal estimatedQuantity;
}
