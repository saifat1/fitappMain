package ru.fitapp.backend.trainer.client.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class CreateManualTrainerClientRequest {

    @Email(message = "Некорректный email")
    @Size(max = 255, message = "Email не должен быть длиннее 255 символов")
    private String email;

    @Size(max = 100, message = "Имя не должно быть длиннее 100 символов")
    private String firstName;

    @Size(max = 100, message = "Фамилия не должна быть длиннее 100 символов")
    private String lastName;

    @Size(max = 255, message = "Номер договора не должен быть длиннее 255 символов")
    private String initialContractNumber;

    @Min(value = 1, message = "Количество тренировок должно быть не меньше 1")
    private Integer initialContractTotalTrainings;

    public String getEmail() {
        return email;
    }

    public CreateManualTrainerClientRequest setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getFirstName() {
        return firstName;
    }

    public CreateManualTrainerClientRequest setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public String getLastName() {
        return lastName;
    }

    public CreateManualTrainerClientRequest setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public String getInitialContractNumber() {
        return initialContractNumber;
    }

    public CreateManualTrainerClientRequest setInitialContractNumber(String initialContractNumber) {
        this.initialContractNumber = initialContractNumber;
        return this;
    }

    public Integer getInitialContractTotalTrainings() {
        return initialContractTotalTrainings;
    }

    public CreateManualTrainerClientRequest setInitialContractTotalTrainings(Integer initialContractTotalTrainings) {
        this.initialContractTotalTrainings = initialContractTotalTrainings;
        return this;
    }
}