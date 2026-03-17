package com.procurement.poservice.client;

import com.procurement.common.dto.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "supplier-service")
public interface SupplierServiceClient {

    @GetMapping("/api/v1/suppliers/{id}")
    CommonResponse<Object> getSupplierById(@PathVariable("id") String id, 
                                           @RequestHeader("Authorization") String token);
}
