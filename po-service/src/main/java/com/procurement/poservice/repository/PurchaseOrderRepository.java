package com.procurement.poservice.repository;

import com.procurement.poservice.model.PurchaseOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends MongoRepository<PurchaseOrder, String> {
    List<PurchaseOrder> findByCreatedBy(String createdBy);
    List<PurchaseOrder> findByStatus(String status);
}
