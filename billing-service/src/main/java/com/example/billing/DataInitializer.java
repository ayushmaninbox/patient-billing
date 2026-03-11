package com.example.billing;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
@Component @RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final BillingRepository repo;
    @Override public void run(String... args) {
        repo.save(new BillingRecord(null, "P101", new BigDecimal("12450.00"), "PAID", LocalDate.now().minusDays(15)));
        repo.save(new BillingRecord(null, "P101", new BigDecimal("2100.50"), "PENDING", LocalDate.now().plusDays(10)));
        repo.save(new BillingRecord(null, "P102", new BigDecimal("550.00"), "OVERDUE", LocalDate.now().minusDays(30)));
        repo.save(new BillingRecord(null, "P102", new BigDecimal("1200.00"), "PAID", LocalDate.now().minusDays(5)));
        repo.save(new BillingRecord(null, "P103", new BigDecimal("45000.00"), "PENDING", LocalDate.now().plusDays(45)));
    }
}
