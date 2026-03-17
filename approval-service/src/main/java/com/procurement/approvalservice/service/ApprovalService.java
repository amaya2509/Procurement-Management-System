package com.procurement.approvalservice.service;

import com.procurement.approvalservice.client.POServiceClient;
import com.procurement.approvalservice.client.PRServiceClient;
import com.procurement.approvalservice.model.Approval;
import com.procurement.approvalservice.repository.ApprovalRepository;
import com.procurement.common.exception.BusinessRuleException;
import com.procurement.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final PRServiceClient prClient;
    private final POServiceClient poClient;
    private final SimpMessagingTemplate messagingTemplate;

    public Approval createApprovalRequest(String entityType, String entityId, String requestedBy) {
        Approval approval = Approval.builder()
                .entityType(entityType)
                .entityId(entityId)
                .status("PENDING")
                .requestedBy(requestedBy)
                .createdAt(new Date())
                .build();
        Approval savedApproval = approvalRepository.save(approval);
        
        // Publish real-time notification
        messagingTemplate.convertAndSend("/topic/approvals", "New Approval Request for " + entityType + " " + entityId);
        
        return savedApproval;
    }

    public List<Approval> getPendingApprovals() {
        return approvalRepository.findByStatus("PENDING");
    }

    @Transactional
    public Approval actionApproval(String id, String action, String rejectReason, String token, String approverId, String approverRole) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval request not found"));

        if (!approval.getStatus().equals("PENDING")) {
            throw new BusinessRuleException("Approval request is already " + approval.getStatus());
        }

        // Validate Role (simulated, token validation handles this at API layer if strictly enforced. We just double check).
        if (!approverRole.equals("APPROVER") && !approverRole.equals("ADMIN")) {
            throw new BusinessRuleException("You do not have permission to approve/reject requests.");
        }

        String newStatus = action.toUpperCase(); // APPROVED or REJECTED
        
        if (newStatus.equals("REJECTED") && (rejectReason == null || rejectReason.isEmpty())) {
             throw new BusinessRuleException("Reject reason is required when rejecting a request.");
        }

        approval.setStatus(newStatus);
        approval.setApprovedBy(approverId);
        approval.setActionedAt(new Date());
        
        if (newStatus.equals("REJECTED")) {
            approval.setRejectReason(rejectReason);
        }

        Approval savedApproval = approvalRepository.save(approval);

        // Synchronously Update the Source Service
        if (approval.getEntityType().equalsIgnoreCase("PR")) {
            prClient.updatePRStatus(approval.getEntityId(), newStatus, rejectReason, token);
        } else if (approval.getEntityType().equalsIgnoreCase("PO")) {
            poClient.updatePOStatus(approval.getEntityId(), newStatus, rejectReason, token);
        }

        // Publish real-time notification
        messagingTemplate.convertAndSend("/topic/approvals", "Approval Request " + approval.getEntityId() + " was " + newStatus);

        return savedApproval;
    }
}
