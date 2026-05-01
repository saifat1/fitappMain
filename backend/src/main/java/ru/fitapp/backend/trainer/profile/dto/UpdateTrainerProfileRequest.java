package ru.fitapp.backend.trainer.profile.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateTrainerProfileRequest {

    @Size(max = 100, message = "Имя не должно быть длиннее 100 символов")
    private String firstName;

    @Size(max = 100, message = "Фамилия не должна быть длиннее 100 символов")
    private String lastName;

    @Pattern(
            regexp = "^$|^[0-9+()\\-\\s]{5,32}$",
            message = "Телефон должен содержать от 5 до 32 символов: цифры, пробелы, +, -, (, )"
    )
    private String phone;

    public String getFirstName() {
        return firstName;
    }

    public UpdateTrainerProfileRequest setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public String getLastName() {
        return lastName;
    }

    public UpdateTrainerProfileRequest setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public String getPhone() {
        return phone;
    }

    public UpdateTrainerProfileRequest setPhone(String phone) {
        this.phone = phone;
        return this;
    }
}