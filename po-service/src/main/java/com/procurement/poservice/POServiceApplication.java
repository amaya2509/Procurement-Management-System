package com.procurement.poservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {"com.procurement.poservice", "com.procurement.common"})
@EnableDiscoveryClient
@EnableFeignClients
public class POServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(POServiceApplication.class, args);
    }
}
