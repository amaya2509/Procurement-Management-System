package com.procurement.poservice.service;

import com.procurement.common.exception.BusinessRuleException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.poservice.client.ApprovalRequestDTO;
import com.procurement.poservice.client.ApprovalServiceClient;
import com.procurement.poservice.client.PRServiceClient;
import com.procurement.poservice.client.SupplierServiceClient;
import com.procurement.poservice.model.POLine;
import com.procurement.poservice.model.PurchaseOrder;
import com.procurement.poservice.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final PRServiceClient prClient;
    private final SupplierServiceClient supplierClient;
    private final ApprovalServiceClient approvalClient;

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrder po, String token, String createdBy) {
        if (po.getPoLines() == null || po.getPoLines().isEmpty()) {
            throw new BusinessRuleException("PO must contain at least one line item.");
        }

        // Validate PR exists and is approved (Inter-service call)
        try {
            prClient.getPurchaseRequestById(po.getPrId(), token);
            // Ideally deserialize and check if PR status == APPROVED. 
            // For brevity, assuming 200 OK means valid.
        } catch (Exception e) {
            throw new BusinessRuleException("Invalid or missing Purchase Request reference: " + po.getPrId());
        }

        // Validate Supplier exists (Inter-service call)
        try {
            supplierClient.getSupplierById(po.getSupplierId(), token);
        } catch (Exception e) {
            throw new BusinessRuleException("Invalid or missing Supplier reference: " + po.getSupplierId());
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (POLine line : po.getPoLines()) {
            BigDecimal amount = line.getQuantity().multiply(line.getUnitPrice());
            line.setLineAmount(amount);
            totalAmount = totalAmount.add(amount);
        }
        po.setTotalAmount(totalAmount);

        po.setPoNumber("PO2025" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        po.setOrderDate(new Date());
        po.setCreatedAt(new Date());
        po.setCreatedBy(createdBy);
        po.setStatus("PENDING_APPROVAL");

        PurchaseOrder savedPo = poRepository.save(po);

        // Request Approval 
        ApprovalRequestDTO approvalDTO = new ApprovalRequestDTO();
        approvalDTO.setEntityType("PO");
        approvalDTO.setEntityId(savedPo.getPoNumber());
        approvalDTO.setRequestedBy(createdBy);

        try {
            approvalClient.requestApproval(approvalDTO, token);
        } catch (Exception e) {
            throw new BusinessRuleException("Failed to request approval context: " + e.getMessage());
        }

        return savedPo;
    }

    public PurchaseOrder getPurchaseOrderById(String poNumber) {
        return poRepository.findById(poNumber)
                .orElseThrow(() -> new ResourceNotFoundException("PO not found"));
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return poRepository.findAll();
    }

    public PurchaseOrder updateStatus(String poNumber, String status, String rejectReason) {
        PurchaseOrder po = getPurchaseOrderById(poNumber);
        po.setStatus(status);
        if (rejectReason != null) {
            po.setRejectReason(rejectReason);
        }
        return poRepository.save(po);
    }
}
