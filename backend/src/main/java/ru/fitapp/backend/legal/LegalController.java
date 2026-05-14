package ru.fitapp.backend.legal;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/legal")
public class LegalController {

    private final UserConsentService userConsentService;
    private final UserService userService;

    public LegalController(
            UserConsentService userConsentService,
            UserService userService
    ) {
        this.userConsentService = userConsentService;
        this.userService = userService;
    }

    @GetMapping("/consents/status")
    public ConsentStatusResponse getConsentStatus() {
        AppUser user = getCurrentUser();

        List<String> missingConsents = userConsentService.getRequiredMissingConsents(user.getId())
                .stream()
                .map(Enum::name)
                .toList();

        return new ConsentStatusResponse()
                .setRequiresConsent(!missingConsents.isEmpty())
                .setRequiredConsents(missingConsents);
    }

    @PostMapping("/consents/accept")
    public ConsentStatusResponse acceptConsents(HttpServletRequest request) {
        AppUser user = getCurrentUser();

        userConsentService.acceptRequiredConsents(user.getId(), request);

        return getConsentStatus();
    }

    private AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new ApiException("UNAUTHORIZED", "Пользователь не авторизован");
        }

        return userService.getByEmail(authentication.getName());
    }
}