package com.procurement.approvalservice.repository;

import com.procurement.approvalservice.model.Approval;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRepository extends MongoRepository<Approval, String> {
    List<Approval> findByStatus(String status);
    List<Approval> findByEntityTypeAndEntityId(String entityType, String entityId);
}
