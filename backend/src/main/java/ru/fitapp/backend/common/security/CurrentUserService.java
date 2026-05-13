package ru.fitapp.backend.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.user.service.UserService;

@Service
@Transactional(readOnly = true)
public class CurrentUserService {

    private final UserService userService;

    public CurrentUserService(UserService userService) {
        this.userService = userService;
    }

    public AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new ApiException("UNAUTHORIZED", "Пользователь не авторизован");
        }

        return userService.getByEmail(authentication.getName());
    }

    public AppUser getCurrentAdmin() {
        AppUser user = getCurrentUser();

        if (!user.isAdmin()) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только администратору");
        }

        return user;
    }

    public AppUser getCurrentTrainer() {
        AppUser user = getCurrentUser();

        if (user.getRole() != UserRole.TRAINER) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только тренеру");
        }

        return user;
    }
}