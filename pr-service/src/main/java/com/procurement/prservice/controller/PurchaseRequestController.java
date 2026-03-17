package com.procurement.prservice.controller;

import com.procurement.common.dto.CommonResponse;
import com.procurement.common.security.JwtUtils;
import com.procurement.prservice.model.PurchaseRequest;
import com.procurement.prservice.service.PurchaseRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/purchase-requests")
@RequiredArgsConstructor
public class PurchaseRequestController {

    private final PurchaseRequestService prService;
    private final JwtUtils jwtUtils;

    @PostMapping
    public ResponseEntity<CommonResponse<PurchaseRequest>> createPurchaseRequest(
            @RequestBody PurchaseRequest pr,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String requestorId = jwtUtils.extractClaim(token, claims -> claims.get("userId", String.class));
        
        PurchaseRequest createdPr = prService.createPurchaseRequest(pr, authHeader, requestorId);
        return ResponseEntity.ok(CommonResponse.success(createdPr, "Purchase Request created successfully and submitted for approval."));
    }

    @GetMapping("/{prNumber}")
    public ResponseEntity<CommonResponse<PurchaseRequest>> getPurchaseRequest(@PathVariable String prNumber) {
        PurchaseRequest pr = prService.getPurchaseRequestById(prNumber);
        return ResponseEntity.ok(CommonResponse.success(pr, "Purchase Request fetched successfully."));
    }

    @GetMapping
    public ResponseEntity<CommonResponse<List<PurchaseRequest>>> getAllPurchaseRequests() {
        List<PurchaseRequest> prs = prService.getAllPurchaseRequests();
        return ResponseEntity.ok(CommonResponse.success(prs, "Purchase Requests fetched successfully."));
    }

    // Endpoint intended to be called by the Approval Workflow Service
    @PutMapping("/{prNumber}/status")
    public ResponseEntity<CommonResponse<PurchaseRequest>> updateStatus(
            @PathVariable String prNumber,
            @RequestParam String status,
            @RequestParam(required = false) String rejectReason) {
        PurchaseRequest updatedPr = prService.updateStatus(prNumber, status, rejectReason);
        return ResponseEntity.ok(CommonResponse.success(updatedPr, "Purchase Request status updated successfully."));
    }
}
