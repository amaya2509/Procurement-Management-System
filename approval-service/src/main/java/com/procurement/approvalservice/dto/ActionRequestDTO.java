package com.procurement.approvalservice.dto;

import lombok.Data;

@Data
public class ActionRequestDTO {
    private String action; // APPROVED, REJECTED
    private String rejectReason;
}
