package com.sujan.procurement.service;

import com.sujan.procurement.dto.request.TokenGenerateRequest;
import com.sujan.procurement.dto.response.QueueTokenResponse;

import java.util.List;

public interface QueueService {
    QueueTokenResponse generateToken(String username, TokenGenerateRequest request);
    List<QueueTokenResponse> getStatus(Long centerId);
    QueueTokenResponse callNext(Long centerId);
    QueueTokenResponse completeToken(Long tokenId);
}
