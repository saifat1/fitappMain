package ru.fitapp.backend.clienttrainer.dto;

public class ClientTrainerResponse {

    private Long trainerId;
    private String trainerEmail;
    private String trainerFirstName;
    private String trainerLastName;

    public Long getTrainerId() {
        return trainerId;
    }

    public ClientTrainerResponse setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
        return this;
    }

    public String getTrainerEmail() {
        return trainerEmail;
    }

    public ClientTrainerResponse setTrainerEmail(String trainerEmail) {
        this.trainerEmail = trainerEmail;
        return this;
    }

    public String getTrainerFirstName() {
        return trainerFirstName;
    }

    public ClientTrainerResponse setTrainerFirstName(String trainerFirstName) {
        this.trainerFirstName = trainerFirstName;
        return this;
    }

    public String getTrainerLastName() {
        return trainerLastName;
    }

    public ClientTrainerResponse setTrainerLastName(String trainerLastName) {
        this.trainerLastName = trainerLastName;
        return this;
    }
}
