package ru.fitapp.backend.common.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ru.fitapp.backend.user.service.UserService;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String email = "trainer@test.local";

        if (!userService.existsByEmail(email)) {
            userService.createTrainer(
                    email,
                    passwordEncoder.encode("123456"),
                    "Test",
                    "Trainer"
            );
        }
    }
}