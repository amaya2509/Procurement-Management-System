package com.procurement.prservice.service;

import com.procurement.common.exception.BusinessRuleException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.prservice.client.ApprovalRequestDTO;
import com.procurement.prservice.client.ApprovalServiceClient;
import com.procurement.prservice.model.PRLine;
import com.procurement.prservice.model.PurchaseRequest;
import com.procurement.prservice.repository.PurchaseRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseRequestService {

    private final PurchaseRequestRepository prRepository;
    private final ApprovalServiceClient approvalClient;

    @Transactional
    public PurchaseRequest createPurchaseRequest(PurchaseRequest pr, String token, String requestorId) {
        if (pr.getPrLines() == null || pr.getPrLines().isEmpty()) {
            throw new BusinessRuleException("PR must contain at least one line item.");
        }

        // Calculate line amounts
        for (PRLine line : pr.getPrLines()) {
            BigDecimal amount = line.getQuantity().multiply(line.getUnitPrice());
            line.setLineAmount(amount);
        }

        pr.setPrNumber("PR2025" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        pr.setRequisitionDate(new Date());
        pr.setCreatedAt(new Date());
        pr.setRequestorId(requestorId);
        pr.setStatus("PENDING_APPROVAL");

        PurchaseRequest savedPr = prRepository.save(pr);

        // Notify Approval Service
        ApprovalRequestDTO approvalDTO = new ApprovalRequestDTO();
        approvalDTO.setEntityType("PR");
        approvalDTO.setEntityId(savedPr.getPrNumber());
        approvalDTO.setRequestedBy(requestorId);
        
        try {
            approvalClient.requestApproval(approvalDTO, token);
        } catch (Exception e) {
            // Rollback/Compensation logic usually needed here in microservices.
            throw new BusinessRuleException("Failed to request approval context: " + e.getMessage());
        }

        return savedPr;
    }

    public PurchaseRequest getPurchaseRequestById(String prNumber) {
        return prRepository.findById(prNumber)
                .orElseThrow(() -> new ResourceNotFoundException("PR not found"));
    }

    public List<PurchaseRequest> getAllPurchaseRequests() {
        return prRepository.findAll();
    }

    public PurchaseRequest updateStatus(String prNumber, String status, String rejectReason) {
        PurchaseRequest pr = getPurchaseRequestById(prNumber);
        pr.setStatus(status);
        if (rejectReason != null) {
            pr.setRejectReason(rejectReason);
        }
        return prRepository.save(pr);
    }
}
