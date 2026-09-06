package com.sujan.procurement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "farmers")
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true)
    private String aadharNumber;

    private String village;

    private String district;

    private String bankAccountNumber;

    private String ifscCode;
}
