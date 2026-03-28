package com.example.patient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.retry.annotation.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;
import java.util.*;

@Service @Slf4j
public class BillingClient {
    private final RestTemplate restTemplate;
    private final String billingServiceUrl;
    
    public static class BillingResponse {
        public List<BillingRecordDTO> records;
        public boolean isFallback;
    }

    public BillingClient(RestTemplateBuilder builder, @Value("${billing.service.url}") String url) {
        this.restTemplate = builder.setConnectTimeout(Duration.ofSeconds(2)).setReadTimeout(Duration.ofSeconds(2)).build();
        this.billingServiceUrl = url;
    }
    
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public BillingResponse getBillingRecords(String patientId) {
        log.info("Fetching billing for patient {}...", patientId);
        BillingRecordDTO[] res = restTemplate.getForObject(billingServiceUrl + "/" + patientId, BillingRecordDTO[].class);
        BillingResponse response = new BillingResponse();
        response.records = res != null ? Arrays.asList(res) : Collections.emptyList();
        response.isFallback = false;
        return response;
    }
    
    @Recover public BillingResponse recover(Exception e, String patientId) {
        log.error("Recovering for patient {}: {}", patientId, e.getMessage());
        BillingResponse response = new BillingResponse();
        response.records = Collections.emptyList();
        response.isFallback = true;
        return response;
    }
}
