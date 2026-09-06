package com.sujan.procurement.service;

import com.sujan.procurement.dto.request.ProcurementRequest;
import com.sujan.procurement.dto.response.ProcurementResponse;

public interface ProcurementService {
    ProcurementResponse record(String staffUsername, ProcurementRequest request);
}
