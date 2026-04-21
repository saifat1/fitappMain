package ru.fitapp.backend.bookingrequest.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.bookingrequest.dto.BookingRequestResponse;
import ru.fitapp.backend.bookingrequest.dto.ReviewBookingRequest;
import ru.fitapp.backend.bookingrequest.service.BookingRequestService;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/booking-requests")
public class TrainerBookingRequestController {

    private final BookingRequestService bookingRequestService;

    public TrainerBookingRequestController(BookingRequestService bookingRequestService) {
        this.bookingRequestService = bookingRequestService;
    }

    @GetMapping
    public List<BookingRequestResponse> getRequests() {
        return bookingRequestService.getCurrentTrainerRequests();
    }

    @PostMapping("/{requestId}/approve")
    public BookingRequestResponse approve(
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) ReviewBookingRequest request
    ) {
        String trainerComment = request == null ? null : request.getTrainerComment();
        return bookingRequestService.approveForCurrentTrainer(requestId, trainerComment);
    }

    @PostMapping("/{requestId}/decline")
    public BookingRequestResponse decline(
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) ReviewBookingRequest request
    ) {
        String trainerComment = request == null ? null : request.getTrainerComment();
        return bookingRequestService.declineForCurrentTrainer(requestId, trainerComment);
    }
}
