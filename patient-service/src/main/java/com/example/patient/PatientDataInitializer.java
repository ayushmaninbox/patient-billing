package com.example.patient;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import java.io.InputStream;
import java.util.List;

@Component @RequiredArgsConstructor
public class PatientDataInitializer implements CommandLineRunner {
    private final PatientRepository repo;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    @Override public void run(String... args) throws Exception {
        Resource resource = resourceLoader.getResource("classpath:patients.json");
        try (InputStream inputStream = resource.getInputStream()) {
            List<Patient> patients = objectMapper.readValue(inputStream, new TypeReference<List<Patient>>() {});
            repo.saveAll(patients);
        }
    }
}
