package com.procurement.poservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "purchase_orders")
public class PurchaseOrder {
    @Id
    private String poNumber; // Primary Key e.g., PO2025000001
    private String prId; // ID of the referenced approved PR
    private String supplierId;
    private String branchId;
    private String description;
    private String status; // PENDING_APPROVAL, APPROVED, REJECTED
    private String currency; 
    private BigDecimal totalAmount;
    private Date orderDate;
    private String rejectReason;
    private String createdBy;
    private Date createdAt;

    private List<POLine> poLines;
}
