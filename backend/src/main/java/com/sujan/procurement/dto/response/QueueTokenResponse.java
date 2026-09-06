package com.sujan.procurement.dto.response;

import com.sujan.procurement.enums.TokenStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class QueueTokenResponse {
    private Long id;
    private String tokenNumber;
    private String farmerName;
    private String cropTypeName;
    private BigDecimal estimatedQuantity;
    private TokenStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime calledAt;
}
