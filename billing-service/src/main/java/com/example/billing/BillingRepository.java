package com.example.billing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BillingRepository extends JpaRepository<BillingRecord, Long> {
    List<BillingRecord> findByPatientId(String patientId);
}
