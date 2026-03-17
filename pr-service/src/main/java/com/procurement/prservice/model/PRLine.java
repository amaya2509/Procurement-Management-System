package com.procurement.prservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PRLine {
    private int lineNo;
    private String lineType; // GOODS, SERVICE, ASSET
    private String item;
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineAmount; // Calculated: quantity * unitPrice
}
