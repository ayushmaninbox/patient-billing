package com.example.patient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/patients") @RequiredArgsConstructor @CrossOrigin(origins = "*")
public class PatientController {
    private final PatientRepository repo;
    private final BillingClient client;
    @GetMapping("/{id}")
    public PatientDetailDTO getDetails(@PathVariable String id) {
        Patient p = repo.findById(id).orElseThrow();
        List<BillingRecordDTO> b = client.getBillingRecords(id);
        PatientDetailDTO dto = new PatientDetailDTO();
        dto.setPatient(p); dto.setBillingRecords(b);
        dto.setBillingStatus(b.isEmpty() ? "FALLBACK" : "SUCCESS");
        return dto;
    }
}
