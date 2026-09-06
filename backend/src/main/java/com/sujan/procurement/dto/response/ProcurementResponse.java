package com.sujan.procurement.dto.response;

import com.sujan.procurement.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ProcurementResponse {
    private Long id;
    private String tokenNumber;
    private String farmerName;
    private BigDecimal actualQuantity;
    private String qualityGrade;
    private BigDecimal pricePerUnit;
    private BigDecimal totalAmount;
    private PaymentStatus paymentStatus;
    private LocalDateTime processedAt;
}
