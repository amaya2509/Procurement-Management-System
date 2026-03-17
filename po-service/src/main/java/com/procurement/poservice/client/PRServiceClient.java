package com.procurement.poservice.client;

import com.procurement.common.dto.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "pr-service")
public interface PRServiceClient {

    @GetMapping("/api/v1/purchase-requests/{prNumber}")
    CommonResponse<Object> getPurchaseRequestById(@PathVariable("prNumber") String prNumber, 
                                                  @RequestHeader("Authorization") String token);
}
