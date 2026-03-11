package com.example.billing;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity @Data @NoArgsConstructor @AllArgsConstructor
public class BillingRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String patientId;
    private BigDecimal amount;
    private String status;
    private LocalDate dueDate;
}
