package com.example.billing;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.util.List;

@RestController @RequestMapping("/api/billing") @RequiredArgsConstructor @CrossOrigin(origins = "*") @Slf4j
public class BillingController {
    private final BillingRepository billingRepository;
    private final ObjectMapper objectMapper;

    private void syncJson() {
        try {
            String path = "src/main/resources/billing.json";
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(path), billingRepository.findAll());
            log.info("Synced billing records to JSON file");
        } catch (Exception e) {
            log.error("Failed to sync billing JSON: {}", e.getMessage());
        }
    }

    @GetMapping("/{patientId}")
    public List<BillingRecord> getBillingByPatientId(@PathVariable String patientId) {
        return billingRepository.findByPatientId(patientId);
    }

    @PutMapping("/{id}")
    public BillingRecord updateBillingRecord(@PathVariable Long id, @RequestBody BillingRecord updated) {
        BillingRecord record = billingRepository.findById(id).orElseThrow();
        record.setStatus(updated.getStatus());
        record.setAmount(updated.getAmount());
        BillingRecord saved = billingRepository.save(record);
        syncJson();
        return saved;
    }
}
