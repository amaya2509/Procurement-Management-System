package com.procurement.prservice.client;

import lombok.Data;

@Data
public class ApprovalRequestDTO {
    private String entityType; // PR or PO
    private String entityId;
    private String requestedBy;
}
