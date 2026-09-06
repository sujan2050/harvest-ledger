package com.sujan.procurement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcurementRequest {
    @NotNull
    private Long tokenId;
    @NotNull
    private BigDecimal actualQuantity;
    private String qualityGrade;
    @NotNull
    private BigDecimal pricePerUnit;
}
