package com.sujan.procurement.controller;

import com.sujan.procurement.dto.request.TokenGenerateRequest;
import com.sujan.procurement.dto.response.QueueTokenResponse;
import com.sujan.procurement.service.QueueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    @PostMapping("/token")
    public QueueTokenResponse generateToken(Authentication authentication,
                                             @Valid @RequestBody TokenGenerateRequest request) {
        return queueService.generateToken(authentication.getName(), request);
    }

    @GetMapping("/status/{centerId}")
    public List<QueueTokenResponse> getStatus(@PathVariable Long centerId) {
        return queueService.getStatus(centerId);
    }

    @PostMapping("/call-next/{centerId}")
    public QueueTokenResponse callNext(@PathVariable Long centerId) {
        return queueService.callNext(centerId);
    }

    @PostMapping("/{tokenId}/complete")
    public QueueTokenResponse complete(@PathVariable Long tokenId) {
        return queueService.completeToken(tokenId);
    }
}
