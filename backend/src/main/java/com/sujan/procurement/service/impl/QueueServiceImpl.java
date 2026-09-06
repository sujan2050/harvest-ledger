package com.sujan.procurement.service.impl;

import com.sujan.procurement.dto.request.TokenGenerateRequest;
import com.sujan.procurement.dto.response.QueueTokenResponse;
import com.sujan.procurement.entity.CropType;
import com.sujan.procurement.entity.Farmer;
import com.sujan.procurement.entity.ProcurementCenter;
import com.sujan.procurement.entity.QueueToken;
import com.sujan.procurement.entity.User;
import com.sujan.procurement.enums.TokenStatus;
import com.sujan.procurement.exception.ResourceNotFoundException;
import com.sujan.procurement.repository.CropTypeRepository;
import com.sujan.procurement.repository.FarmerRepository;
import com.sujan.procurement.repository.ProcurementCenterRepository;
import com.sujan.procurement.repository.QueueTokenRepository;
import com.sujan.procurement.repository.UserRepository;
import com.sujan.procurement.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QueueServiceImpl implements QueueService {

    private final QueueTokenRepository queueTokenRepository;
    private final FarmerRepository farmerRepository;
    private final ProcurementCenterRepository centerRepository;
    private final CropTypeRepository cropTypeRepository;
    private final UserRepository userRepository;

    @Override
    public QueueTokenResponse generateToken(String username, TokenGenerateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Farmer farmer = farmerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for this user"));

        ProcurementCenter center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new ResourceNotFoundException("Center not found: " + request.getCenterId()));

        CropType cropType = cropTypeRepository.findById(request.getCropTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Crop type not found: " + request.getCropTypeId()));

        QueueToken token = new QueueToken();
        token.setFarmer(farmer);
        token.setCenter(center);
        token.setCropType(cropType);
        token.setEstimatedQuantity(request.getEstimatedQuantity());
        token.setStatus(TokenStatus.WAITING);

        long todayCount = queueTokenRepository.countByCenterIdAndStatus(center.getId(), TokenStatus.WAITING) + 1;
        token.setTokenNumber(center.getId() + "-" + LocalDateTime.now().toLocalDate() + "-" + todayCount);

        QueueToken saved = queueTokenRepository.save(token);
        return toResponse(saved);
    }

    @Override
    public List<QueueTokenResponse> getStatus(Long centerId) {
        return queueTokenRepository.findByCenterIdOrderByCreatedAtAsc(centerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public QueueTokenResponse callNext(Long centerId) {
        QueueToken next = queueTokenRepository
                .findFirstByCenterIdAndStatusOrderByCreatedAtAsc(centerId, TokenStatus.WAITING)
                .orElseThrow(() -> new ResourceNotFoundException("No waiting tokens for this center"));

        next.setStatus(TokenStatus.CALLED);
        next.setCalledAt(LocalDateTime.now());
        QueueToken updated = queueTokenRepository.save(next);
        return toResponse(updated);
    }

    @Override
    public QueueTokenResponse completeToken(Long tokenId) {
        QueueToken token = queueTokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found: " + tokenId));

        token.setStatus(TokenStatus.COMPLETED);
        QueueToken updated = queueTokenRepository.save(token);
        return toResponse(updated);
    }

    private QueueTokenResponse toResponse(QueueToken token) {
        return new QueueTokenResponse(
                token.getId(),
                token.getTokenNumber(),
                token.getFarmer().getFullName(),
                token.getCropType().getName(),
                token.getEstimatedQuantity(),
                token.getStatus(),
                token.getCreatedAt(),
                token.getCalledAt()
        );
    }
}
