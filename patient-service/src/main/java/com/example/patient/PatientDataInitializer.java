package com.example.patient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
@Component @RequiredArgsConstructor
public class PatientDataInitializer implements CommandLineRunner {
    private final PatientRepository repo;
    @Override public void run(String... args) {
        repo.save(new Patient("P101", "Alex Montgomery", "alex.m@quantum-health.com", "+1 (555) 012-8844", "742 Evergreen Terrace, Springfield", "A+", "Male", "1988-11-12"));
        repo.save(new Patient("P102", "Sarah Jenkins", "sjenks@nova-medical.org", "+1 (555) 039-2211", "121 Baker St, London", "O-", "Female", "1992-05-24"));
        repo.save(new Patient("P103", "Victor Thorne", "v.thorne@apex-labs.com", "+1 (555) 088-7766", "Thorne Manor, Gotham", "B+", "Male", "1975-09-30"));
    }
}
