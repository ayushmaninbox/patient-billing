package com.example.billing;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component @RequiredArgsConstructor @Slf4j
public class DataInitializer implements CommandLineRunner {
    private final BillingRepository repo;
    private final ObjectMapper objectMapper;

    @Override public void run(String... args) {
        File file = new File("src/main/resources/billing.json");
        if (file.exists()) {
            try {
                List<BillingRecord> records = objectMapper.readValue(file, new TypeReference<List<BillingRecord>>(){});
                repo.saveAll(records);
                log.info("Initialized billing data from billing.json");
                return;
            } catch (Exception e) {
                log.error("Failed to load billing.json, falling back to defaults: {}", e.getMessage());
            }
        }

        repo.save(new BillingRecord(null, "P101", new BigDecimal("12450.00"), "PAID", LocalDate.now().minusDays(15)));
        repo.save(new BillingRecord(null, "P101", new BigDecimal("2100.50"), "PENDING", LocalDate.now().plusDays(10)));
        
        repo.save(new BillingRecord(null, "P102", new BigDecimal("850.25"), "PAID", LocalDate.now().minusDays(30)));
        repo.save(new BillingRecord(null, "P102", new BigDecimal("420.00"), "OVERDUE", LocalDate.now().minusDays(5)));
        
        repo.save(new BillingRecord(null, "P103", new BigDecimal("45000.00"), "PENDING", LocalDate.now().plusDays(45)));
        
        repo.save(new BillingRecord(null, "P104", new BigDecimal("1200.75"), "PAID", LocalDate.now().minusDays(12)));
        repo.save(new BillingRecord(null, "P104", new BigDecimal("350.00"), "PENDING", LocalDate.now().plusDays(20)));
        
        repo.save(new BillingRecord(null, "P105", new BigDecimal("500.00"), "PAID", LocalDate.now().minusDays(45)));
        repo.save(new BillingRecord(null, "P105", new BigDecimal("150.50"), "PENDING", LocalDate.now().plusDays(5)));
        
        repo.save(new BillingRecord(null, "P106", new BigDecimal("25000.00"), "OVERDUE", LocalDate.now().minusDays(60)));
    }
}
