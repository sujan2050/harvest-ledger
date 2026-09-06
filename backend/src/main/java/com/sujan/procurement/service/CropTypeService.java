package com.sujan.procurement.service;

import com.sujan.procurement.dto.request.CropTypeRequest;
import com.sujan.procurement.entity.CropType;

import java.util.List;

public interface CropTypeService {
    CropType create(CropTypeRequest request);
    List<CropType> getAll();
    CropType getById(Long id);
}
