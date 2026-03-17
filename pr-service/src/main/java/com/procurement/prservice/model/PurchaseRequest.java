package com.procurement.prservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "purchase_requests")
public class PurchaseRequest {
    @Id
    private String prNumber; // Primary Key e.g., PR2025000001
    private int year;
    private int runningNumber;
    private String branchId;
    private String departmentId;
    private String description;
    private String status; // e.g. PENDING_APPROVAL, APPROVED, REJECTED
    private String priority; // LOW, MEDIUM, HIGH
    private String requestorId;
    private Date needByDate;
    private Date requisitionDate;
    private String supplierId;
    private String currency; // LKR, USD
    private String rejectReason;
    private Date createdAt;
    
    // Embedding PR Lines inside Header for NoSQL design
    private List<PRLine> prLines; 
}
