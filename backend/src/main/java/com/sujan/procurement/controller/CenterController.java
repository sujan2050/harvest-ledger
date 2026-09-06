package com.sujan.procurement.controller;

import com.sujan.procurement.dto.request.CenterRequest;
import com.sujan.procurement.entity.ProcurementCenter;
import com.sujan.procurement.service.CenterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/centers")
@RequiredArgsConstructor
public class CenterController {

    private final CenterService centerService;

    @PostMapping
    public ProcurementCenter create(@Valid @RequestBody CenterRequest request) {
        return centerService.create(request);
    }

    @GetMapping
    public List<ProcurementCenter> getAll() {
        return centerService.getAll();
    }

    @GetMapping("/{id}")
    public ProcurementCenter getById(@PathVariable Long id) {
        return centerService.getById(id);
    }
}
