package com.sujan.procurement.service.impl;

import com.sujan.procurement.dto.request.CropTypeRequest;
import com.sujan.procurement.entity.CropType;
import com.sujan.procurement.exception.ResourceNotFoundException;
import com.sujan.procurement.repository.CropTypeRepository;
import com.sujan.procurement.service.CropTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CropTypeServiceImpl implements CropTypeService {

    private final CropTypeRepository cropTypeRepository;

    @Override
    public CropType create(CropTypeRequest request) {
        CropType cropType = new CropType();
        cropType.setName(request.getName());
        cropType.setCategory(request.getCategory());
        cropType.setUnit(request.getUnit());
        cropType.setBasePrice(request.getBasePrice());
        cropType.setMspPrice(request.getMspPrice());
        return cropTypeRepository.save(cropType);
    }

    @Override
    public List<CropType> getAll() {
        return cropTypeRepository.findAll();
    }

    @Override
    public CropType getById(Long id) {
        return cropTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop type not found: " + id));
    }
}
