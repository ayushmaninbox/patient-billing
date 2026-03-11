package com.example.billing;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/billing") @RequiredArgsConstructor @CrossOrigin(origins = "*")
public class BillingController {
    private final BillingRepository billingRepository;
    @GetMapping("/{patientId}")
    public List<BillingRecord> getBillingByPatientId(@PathVariable String patientId) {
        if (Math.random() < 0.3) throw new RuntimeException("Billing Service Failure");
        return billingRepository.findByPatientId(patientId);
    }
}
