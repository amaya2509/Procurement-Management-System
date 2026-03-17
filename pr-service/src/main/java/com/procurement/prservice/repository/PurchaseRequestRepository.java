package com.procurement.prservice.repository;

import com.procurement.prservice.model.PurchaseRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRequestRepository extends MongoRepository<PurchaseRequest, String> {
    List<PurchaseRequest> findByRequestorId(String requestorId);
    List<PurchaseRequest> findByStatus(String status);
}
