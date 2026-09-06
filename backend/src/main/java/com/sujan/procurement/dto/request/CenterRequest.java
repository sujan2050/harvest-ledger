package com.sujan.procurement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class CenterRequest {
    @NotBlank
    private String name;
    private String location;
    @NotNull
    private Integer capacityPerDay;
    private LocalTime operatingStart;
    private LocalTime operatingEnd;
}
