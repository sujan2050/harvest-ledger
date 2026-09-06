package com.sujan.procurement.service.impl;

import com.sujan.procurement.dto.request.CenterRequest;
import com.sujan.procurement.entity.ProcurementCenter;
import com.sujan.procurement.exception.ResourceNotFoundException;
import com.sujan.procurement.repository.ProcurementCenterRepository;
import com.sujan.procurement.service.CenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CenterServiceImpl implements CenterService {

    private final ProcurementCenterRepository centerRepository;

    @Override
    public ProcurementCenter create(CenterRequest request) {
        ProcurementCenter center = new ProcurementCenter();
        center.setName(request.getName());
        center.setLocation(request.getLocation());
        center.setCapacityPerDay(request.getCapacityPerDay());
        center.setOperatingStart(request.getOperatingStart());
        center.setOperatingEnd(request.getOperatingEnd());
        return centerRepository.save(center);
    }

    @Override
    public List<ProcurementCenter> getAll() {
        return centerRepository.findAll();
    }

    @Override
    public ProcurementCenter getById(Long id) {
        return centerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Center not found: " + id));
    }
}
