package com.sujan.procurement.repository;

import com.sujan.procurement.entity.Procurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProcurementRepository extends JpaRepository<Procurement, Long> {
    Optional<Procurement> findByTokenId(Long tokenId);
}
