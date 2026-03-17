package com.procurement.approvalservice.dto;

import lombok.Data;

@Data
public class ApprovalRequestDTO {
    private String entityType;
    private String entityId;
    private String requestedBy;
}
