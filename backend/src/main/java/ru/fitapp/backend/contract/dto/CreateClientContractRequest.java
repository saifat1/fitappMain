package ru.fitapp.backend.contract.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateClientContractRequest {

    @Size(max = 255, message = "Номер договора не должен быть длиннее 255 символов")
    private String contractNumber;

    @NotNull(message = "Укажите количество оплаченных тренировок")
    @Min(value = 1, message = "Количество тренировок должно быть не меньше 1")
    private Integer totalTrainings;

    /** Optional — the trainer is notified ~10 days before this date. */
    private LocalDate endDate;

    public String getContractNumber() {
        return contractNumber;
    }

    public CreateClientContractRequest setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
        return this;
    }

    public Integer getTotalTrainings() {
        return totalTrainings;
    }

    public CreateClientContractRequest setTotalTrainings(Integer totalTrainings) {
        this.totalTrainings = totalTrainings;
        return this;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public CreateClientContractRequest setEndDate(LocalDate endDate) {
        this.endDate = endDate;
        return this;
    }
}
