package com.sujan.procurement.controller;

import com.sujan.procurement.dto.request.CropTypeRequest;
import com.sujan.procurement.entity.CropType;
import com.sujan.procurement.service.CropTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crop-types")
@RequiredArgsConstructor
public class CropTypeController {

    private final CropTypeService cropTypeService;

    @PostMapping
    public CropType create(@Valid @RequestBody CropTypeRequest request) {
        return cropTypeService.create(request);
    }

    @GetMapping
    public List<CropType> getAll() {
        return cropTypeService.getAll();
    }

    @GetMapping("/{id}")
    public CropType getById(@PathVariable Long id) {
        return cropTypeService.getById(id);
    }
}
