package com.procurement.userservice.config;

import com.procurement.userservice.model.Role;
import com.procurement.userservice.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            Role admin = new Role(null, "ADMIN", Arrays.asList("ALL"));
            Role requester = new Role(null, "REQUESTER", Arrays.asList("CREATE_PR", "VIEW_PR", "CREATE_PO", "VIEW_PO"));
            Role approver = new Role(null, "APPROVER", Arrays.asList("APPROVE_PR", "REJECT_PR", "APPROVE_PO", "REJECT_PO", "VIEW_PR", "VIEW_PO"));

            roleRepository.saveAll(Arrays.asList(admin, requester, approver));
        }
    }
}
