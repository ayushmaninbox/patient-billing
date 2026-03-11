package com.example.patient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.util.List;

@RestController @RequestMapping("/api/patients") @RequiredArgsConstructor @CrossOrigin(origins = "*") @Slf4j
public class PatientController {
    private final PatientRepository repo;
    private final BillingClient client;
    private final ObjectMapper objectMapper;

    private void syncJson() {
        try {
            // In a real app we'd use a database, but for this demo we sync to the source file
            String path = "src/main/resources/patients.json";
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(path), repo.findAll());
            log.info("Synced patients to JSON file");
        } catch (Exception e) {
            log.error("Failed to sync JSON: {}", e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public PatientDetailDTO getDetails(@PathVariable String id) {
        Patient p = repo.findById(id).orElseThrow();
        List<BillingRecordDTO> b = client.getBillingRecords(id);
        PatientDetailDTO dto = new PatientDetailDTO();
        dto.setPatient(p); dto.setBillingRecords(b);
        dto.setBillingStatus(b.isEmpty() ? "FALLBACK" : "SUCCESS");
        return dto;
    }

    @PostMapping
    public Patient addPatient(@RequestBody Patient patient) {
        if (repo.existsById(patient.getId())) throw new RuntimeException("Patient ID already exists");
        Patient saved = repo.save(patient);
        syncJson();
        return saved;
    }

    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable String id, @RequestBody Patient updatedPatient) {
        Patient p = repo.findById(id).orElseThrow();
        p.setName(updatedPatient.getName());
        p.setEmail(updatedPatient.getEmail());
        p.setPhone(updatedPatient.getPhone());
        p.setAddress(updatedPatient.getAddress());
        p.setBloodGroup(updatedPatient.getBloodGroup());
        p.setGender(updatedPatient.getGender());
        p.setDob(updatedPatient.getDob());
        Patient saved = repo.save(p);
        syncJson();
        return saved;
    }
}
