package com.sujan.procurement.controller;

import com.sujan.procurement.dto.request.ProcurementRequest;
import com.sujan.procurement.dto.response.ProcurementResponse;
import com.sujan.procurement.service.ProcurementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/procurement")
@RequiredArgsConstructor
public class ProcurementController {

    private final ProcurementService procurementService;

    @PostMapping
    public ProcurementResponse record(Authentication authentication,
                                       @Valid @RequestBody ProcurementRequest request) {
        return procurementService.record(authentication.getName(), request);
    }
}
