package com.example.patient;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
@Data public class BillingRecordDTO { private Long id; private String patientId; private BigDecimal amount; private String status; private LocalDate dueDate; }
