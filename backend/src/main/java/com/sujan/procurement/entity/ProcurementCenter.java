package com.sujan.procurement.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Data
@Entity
@Table(name = "procurement_centers")
public class ProcurementCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String location;

    private Integer capacityPerDay;

    private LocalTime operatingStart;

    private LocalTime operatingEnd;
}
