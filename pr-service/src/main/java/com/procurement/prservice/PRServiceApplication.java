package com.procurement.prservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {"com.procurement.prservice", "com.procurement.common"})
@EnableDiscoveryClient
@EnableFeignClients
public class PRServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PRServiceApplication.class, args);
    }
}
