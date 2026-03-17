package com.procurement.prservice.client;

import com.procurement.common.dto.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "approval-service")
public interface ApprovalServiceClient {

    @PostMapping("/api/v1/approvals")
    CommonResponse<Object> requestApproval(@RequestBody ApprovalRequestDTO requestDTO, 
                                           @RequestHeader("Authorization") String token);
}
