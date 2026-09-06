package com.sujan.procurement.service;

import com.sujan.procurement.dto.request.CenterRequest;
import com.sujan.procurement.entity.ProcurementCenter;

import java.util.List;

public interface CenterService {
    ProcurementCenter create(CenterRequest request);
    List<ProcurementCenter> getAll();
    ProcurementCenter getById(Long id);
}
