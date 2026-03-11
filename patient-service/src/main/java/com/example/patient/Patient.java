package com.example.patient;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
@Entity @Data @NoArgsConstructor @AllArgsConstructor
public class Patient { 
    @Id private String id; 
    private String name; 
    private String email; 
    private String phone;
    private String address;
    private String bloodGroup;
    private String gender;
    private String dob;
}
