package com.procurement.approvalservice.controller;

import com.procurement.approvalservice.dto.ActionRequestDTO;
import com.procurement.approvalservice.dto.ApprovalRequestDTO;
import com.procurement.approvalservice.model.Approval;
import com.procurement.approvalservice.service.ApprovalService;
import com.procurement.common.dto.CommonResponse;
import com.procurement.common.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;
    private final JwtUtils jwtUtils;

    // Called by PR/PO Services internally (synchronous REST)
    @PostMapping
    public ResponseEntity<CommonResponse<Approval>> requestApproval(@RequestBody ApprovalRequestDTO request) {
        Approval approval = approvalService.createApprovalRequest(
                request.getEntityType(), 
                request.getEntityId(), 
                request.getRequestedBy()
        );
        return ResponseEntity.ok(CommonResponse.success(approval, "Approval requested successfully."));
    }

    // Called by Approvers on the Frontend
    @GetMapping("/pending")
    public ResponseEntity<CommonResponse<List<Approval>>> getPendingApprovals() {
        List<Approval> approvals = approvalService.getPendingApprovals();
        return ResponseEntity.ok(CommonResponse.success(approvals, "Pending approvals fetched successfully."));
    }

    // Called by Approvers on the Frontend
    @PostMapping("/{id}/action")
    public ResponseEntity<CommonResponse<Approval>> actionApproval(
            @PathVariable String id,
            @RequestBody ActionRequestDTO actionDTO,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String approverId = jwtUtils.extractClaim(token, claims -> claims.get("userId", String.class));
        String approverRole = jwtUtils.extractRole(token);

        Approval actionedApproval = approvalService.actionApproval(
                id, 
                actionDTO.getAction(), 
                actionDTO.getRejectReason(), 
                authHeader, // Pass the token downstream 
                approverId, 
                approverRole
        );
        return ResponseEntity.ok(CommonResponse.success(actionedApproval, "Approval action successfully recorded."));
    }
}
