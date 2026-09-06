package com.sujan.procurement.service.impl;

import com.sujan.procurement.dto.request.ProcurementRequest;
import com.sujan.procurement.dto.response.ProcurementResponse;
import com.sujan.procurement.entity.Procurement;
import com.sujan.procurement.entity.QueueToken;
import com.sujan.procurement.entity.User;
import com.sujan.procurement.enums.PaymentStatus;
import com.sujan.procurement.enums.TokenStatus;
import com.sujan.procurement.exception.ResourceNotFoundException;
import com.sujan.procurement.repository.ProcurementRepository;
import com.sujan.procurement.repository.QueueTokenRepository;
import com.sujan.procurement.repository.UserRepository;
import com.sujan.procurement.service.ProcurementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProcurementServiceImpl implements ProcurementService {

    private final ProcurementRepository procurementRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final UserRepository userRepository;

    @Override
    public ProcurementResponse record(String staffUsername, ProcurementRequest request) {
        User staff = userRepository.findByUsername(staffUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found"));

        QueueToken token = queueTokenRepository.findById(request.getTokenId())
                .orElseThrow(() -> new ResourceNotFoundException("Token not found: " + request.getTokenId()));

        Procurement procurement = new Procurement();
        procurement.setToken(token);
        procurement.setStaff(staff);
        procurement.setActualQuantity(request.getActualQuantity());
        procurement.setQualityGrade(request.getQualityGrade());
        procurement.setPricePerUnit(request.getPricePerUnit());
        procurement.setTotalAmount(request.getActualQuantity().multiply(request.getPricePerUnit()));
        procurement.setPaymentStatus(PaymentStatus.PENDING);

        Procurement saved = procurementRepository.save(procurement);

        token.setStatus(TokenStatus.COMPLETED);
        queueTokenRepository.save(token);

        return toResponse(saved);
    }

    private ProcurementResponse toResponse(Procurement p) {
        return new ProcurementResponse(
                p.getId(),
                p.getToken().getTokenNumber(),
                p.getToken().getFarmer().getFullName(),
                p.getActualQuantity(),
                p.getQualityGrade(),
                p.getPricePerUnit(),
                p.getTotalAmount(),
                p.getPaymentStatus(),
                p.getProcessedAt()
        );
    }
}
