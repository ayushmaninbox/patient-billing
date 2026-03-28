package com.example.patient;
import lombok.Data; import java.util.List;
@Data public class PatientDetailDTO { 
    private Patient patient; 
    private List<BillingRecordDTO> billingRecords; 
    private String billingStatus; 
}
