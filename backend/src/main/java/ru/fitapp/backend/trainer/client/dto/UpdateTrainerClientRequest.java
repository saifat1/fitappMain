package ru.fitapp.backend.trainer.client.dto;

import jakarta.validation.constraints.Size;

public class UpdateTrainerClientRequest {

    @Size(max = 100, message = "Имя не должно быть длиннее 100 символов")
    private String firstName;

    @Size(max = 100, message = "Фамилия не должна быть длиннее 100 символов")
    private String lastName;

    public String getFirstName() {
        return firstName;
    }

    public UpdateTrainerClientRequest setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public String getLastName() {
        return lastName;
    }

    public UpdateTrainerClientRequest setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }
}