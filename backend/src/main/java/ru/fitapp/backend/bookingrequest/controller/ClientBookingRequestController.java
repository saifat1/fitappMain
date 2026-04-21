package ru.fitapp.backend.bookingrequest.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.bookingrequest.dto.BookingRequestResponse;
import ru.fitapp.backend.bookingrequest.dto.CreateBookingRequest;
import ru.fitapp.backend.bookingrequest.service.BookingRequestService;

import java.util.List;

@RestController
@RequestMapping("/api/client/booking-requests")
public class ClientBookingRequestController {

    private final BookingRequestService bookingRequestService;

    public ClientBookingRequestController(BookingRequestService bookingRequestService) {
        this.bookingRequestService = bookingRequestService;
    }

    @GetMapping
    public List<BookingRequestResponse> getMyRequests() {
        return bookingRequestService.getCurrentClientRequests();
    }

    @PostMapping
    public BookingRequestResponse create(@Valid @RequestBody CreateBookingRequest request) {
        return bookingRequestService.createForCurrentClient(request);
    }

    @PostMapping("/{id}/cancel")
    public BookingRequestResponse cancelMyBookingRequest(@PathVariable Long id) {
        return bookingRequestService.cancelForCurrentClient(id);
    }
}
