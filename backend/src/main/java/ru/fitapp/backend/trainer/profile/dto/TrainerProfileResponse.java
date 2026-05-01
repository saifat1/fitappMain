package ru.fitapp.backend.trainer.profile.dto;

public class TrainerProfileResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatarUrl;

    public Long getId() {
        return id;
    }

    public TrainerProfileResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public TrainerProfileResponse setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getFirstName() {
        return firstName;
    }

    public TrainerProfileResponse setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public String getLastName() {
        return lastName;
    }

    public TrainerProfileResponse setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public String getPhone() {
        return phone;
    }

    public TrainerProfileResponse setPhone(String phone) {
        this.phone = phone;
        return this;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public TrainerProfileResponse setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        return this;
    }
}