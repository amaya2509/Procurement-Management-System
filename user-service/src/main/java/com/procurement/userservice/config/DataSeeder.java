package com.procurement.userservice.config;

import com.procurement.userservice.model.Branch;
import com.procurement.userservice.model.Department;
import com.procurement.userservice.model.Role;
import com.procurement.userservice.model.User;
import com.procurement.userservice.repository.BranchRepository;
import com.procurement.userservice.repository.DepartmentRepository;
import com.procurement.userservice.repository.RoleRepository;
import com.procurement.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.Date;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed Roles
        if (roleRepository.count() == 0) {
            Role admin = new Role(null, "ADMIN", Arrays.asList("ALL"));
            Role pr_requester = new Role(null, "PR_REQUESTER", Arrays.asList("CREATE_PR", "VIEW_PR"));
            Role pr_approver = new Role(null, "PR_APPROVER", Arrays.asList("CREATE_PR", "VIEW_PR"));
            Role po_requester = new Role(null, "PO_REQUESTER", Arrays.asList("CREATE_PO", "VIEW_PR"));
            Role po_approver = new Role(null, "PO_APPROVER", Arrays.asList("CREATE_PO", "VIEW_PR"));
            roleRepository.saveAll(Arrays.asList(admin, pr_requester, pr_approver, po_requester, po_approver));
        }

        // Seed Branch
        if (branchRepository.count() == 0) {
            Branch hq = new Branch(null, "Headquarters");
            branchRepository.save(hq);
        }

        // Seed Department
        if (departmentRepository.count() == 0) {
            Department adminDept = new Department(null, "Administration");
            departmentRepository.save(adminDept);
        }

        // Seed Admin User
        if (userRepository.count() == 0) {
            Optional<Role> adminRoleOpt = roleRepository.findAll().stream().filter(r -> "ADMIN".equals(r.getRoleName()))
                    .findFirst();
            Optional<Branch> hqOpt = branchRepository.findAll().stream()
                    .filter(b -> "Headquarters".equals(b.getBranchName())).findFirst();
            Optional<Department> adminDeptOpt = departmentRepository.findAll().stream()
                    .filter(d -> "Administration".equals(d.getDepartmentName())).findFirst();

            if (adminRoleOpt.isPresent() && hqOpt.isPresent() && adminDeptOpt.isPresent()) {
                User adminUser = User.builder()
                        .username("admin")
                        .email("admin@procurement.com")
                        .password(passwordEncoder.encode("admin123"))
                        .roleId(adminRoleOpt.get().getId())
                        .branchId(hqOpt.get().getId())
                        .departmentId(adminDeptOpt.get().getId())
                        .isActive(true)
                        .createdAt(new Date())
                        .build();
                userRepository.save(adminUser);
            }
        }
    }
}
