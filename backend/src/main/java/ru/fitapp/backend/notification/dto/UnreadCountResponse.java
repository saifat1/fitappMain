package ru.fitapp.backend.notification.dto;

public class UnreadCountResponse {

    private long count;

    public UnreadCountResponse() {
    }

    public UnreadCountResponse(long count) {
        this.count = count;
    }

    public long getCount() {
        return count;
    }

    public UnreadCountResponse setCount(long count) {
        this.count = count;
        return this;
    }
}
