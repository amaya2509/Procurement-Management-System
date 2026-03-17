package com.procurement.approvalservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "approvals")
public class Approval {
    @Id
    private String id;
    private String entityType; // e.g., PR or PO
    private String entityId;   // the PR or PO number
    private String status;     // PENDING, APPROVED, REJECTED
    private String requestedBy;
    private String approvedBy; // ID of the Approver user
    private String rejectReason;
    private Date createdAt;
    private Date actionedAt;
}
