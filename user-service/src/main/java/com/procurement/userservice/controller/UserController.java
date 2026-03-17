package com.procurement.userservice.controller;

import com.procurement.common.dto.CommonResponse;
import com.procurement.userservice.model.User;
import com.procurement.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<CommonResponse<User>> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.ok(CommonResponse.success(createdUser, "User created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommonResponse<User>> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(CommonResponse.success(user, "User fetched successfully"));
    }

    @GetMapping
    public ResponseEntity<CommonResponse<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(CommonResponse.success(users, "Users fetched successfully"));
    }
}
