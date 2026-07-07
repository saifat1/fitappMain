package ru.fitapp.backend.contract.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateClientContractRequest {

    @Size(max = 255, message = "Номер договора не должен быть длиннее 255 символов")
    private String contractNumber;

    @NotNull(message = "Укажите количество оплаченных тренировок")
    @Min(value = 1, message = "Количество тренировок должно быть не меньше 1")
    private Integer totalTrainings;

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
}
