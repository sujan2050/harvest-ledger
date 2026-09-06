package com.sujan.procurement.repository;

import com.sujan.procurement.entity.QueueToken;
import com.sujan.procurement.enums.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QueueTokenRepository extends JpaRepository<QueueToken, Long> {
    List<QueueToken> findByCenterIdOrderByCreatedAtAsc(Long centerId);
    Optional<QueueToken> findFirstByCenterIdAndStatusOrderByCreatedAtAsc(Long centerId, TokenStatus status);
    long countByCenterIdAndStatus(Long centerId, TokenStatus status);
}
