package com.procurement.poservice.controller;

import com.procurement.common.dto.CommonResponse;
import com.procurement.common.security.JwtUtils;
import com.procurement.poservice.model.PurchaseOrder;
import com.procurement.poservice.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService poService;
    private final JwtUtils jwtUtils;

    @PostMapping
    public ResponseEntity<CommonResponse<PurchaseOrder>> createPurchaseOrder(
            @RequestBody PurchaseOrder po,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        String createdBy = jwtUtils.extractClaim(token, claims -> claims.get("userId", String.class));

        PurchaseOrder createdPo = poService.createPurchaseOrder(po, authHeader, createdBy);
        return ResponseEntity.ok(CommonResponse.success(createdPo, "Purchase Order created successfully and submitted for approval."));
    }

    @GetMapping("/{poNumber}")
    public ResponseEntity<CommonResponse<PurchaseOrder>> getPurchaseOrder(@PathVariable String poNumber) {
        PurchaseOrder po = poService.getPurchaseOrderById(poNumber);
        return ResponseEntity.ok(CommonResponse.success(po, "Purchase Order fetched successfully."));
    }

    @GetMapping
    public ResponseEntity<CommonResponse<List<PurchaseOrder>>> getAllPurchaseOrders() {
        List<PurchaseOrder> pos = poService.getAllPurchaseOrders();
        return ResponseEntity.ok(CommonResponse.success(pos, "Purchase Orders fetched successfully."));
    }

    // Endpoint intended to be called by the Approval Workflow Service
    @PutMapping("/{poNumber}/status")
    public ResponseEntity<CommonResponse<PurchaseOrder>> updateStatus(
            @PathVariable String poNumber,
            @RequestParam String status,
            @RequestParam(required = false) String rejectReason) {
        PurchaseOrder updatedPo = poService.updateStatus(poNumber, status, rejectReason);
        return ResponseEntity.ok(CommonResponse.success(updatedPo, "Purchase Order status updated successfully."));
    }
}
