package com.procurement.approvalservice.client;

import com.procurement.common.dto.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "po-service")
public interface POServiceClient {

    @PutMapping("/api/v1/purchase-orders/{poNumber}/status")
    CommonResponse<Object> updatePOStatus(
            @PathVariable("poNumber") String poNumber,
            @RequestParam("status") String status,
            @RequestParam(value = "rejectReason", required = false) String rejectReason,
            @RequestHeader("Authorization") String token);
}
