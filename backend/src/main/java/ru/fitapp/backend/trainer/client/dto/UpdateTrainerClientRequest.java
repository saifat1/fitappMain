package ru.fitapp.backend.trainer.client.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UpdateTrainerClientRequest {

    @Size(max = 100, message = "Имя не должно быть длиннее 100 символов")
    private String firstName;

    @Size(max = 100, message = "Фамилия не должна быть длиннее 100 символов")
    private String lastName;

    @Size(max = 100, message = "Номер договора не должен быть длиннее 100 символов")
    private String contractNumber;

    private LocalDate contractEndDate;

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

    public String getContractNumber() {
        return contractNumber;
    }

    public UpdateTrainerClientRequest setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
        return this;
    }

    public LocalDate getContractEndDate() {
        return contractEndDate;
    }

    public UpdateTrainerClientRequest setContractEndDate(LocalDate contractEndDate) {
        this.contractEndDate = contractEndDate;
        return this;
    }
}