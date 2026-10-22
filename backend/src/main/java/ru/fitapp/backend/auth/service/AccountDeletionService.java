package ru.fitapp.backend.auth.service;

import jakarta.persistence.EntityManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.user.model.UserStatus;
import ru.fitapp.backend.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Account deletion by the user (FIT-70, required by the app stores).
 *
 * Rows are not removed: trainings, contracts and payments reference the user and stay in the trainer's
 * history and reports. Instead the account is made anonymous and unusable — email, name, phone and password
 * are replaced, health data (questionnaire, measurements), notifications, push subscriptions and consents
 * are deleted. The JWT stops working at once because it carries the old email.
 */
@Service
@Transactional
public class AccountDeletionService {

    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    public AccountDeletionService(
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            EntityManager entityManager
    ) {
        this.currentUserService = currentUserService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
    }

    public void deleteCurrentAccount(String password) {
        AppUser user = currentUserService.getCurrentUser();

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ApiException("INVALID_PASSWORD", "Неверный пароль");
        }

        Long id = user.getId();

        deleteWhere("push_subscription", "user_id", id);
        deleteWhere("device_push_token", "user_id", id);
        deleteWhere("password_reset_token", "user_id", id);
        deleteWhere("notification", "recipient_id", id);
        deleteWhere("user_consent", "user_id", id);

        if (user.getRole() == UserRole.CLIENT) {
            deleteWhere("client_questionnaire", "client_id", id);
            deleteWhere("client_measurement", "client_id", id);
            entityManager.createNativeQuery("update invite set email = null, status = 'CANCELLED' where client_id = :id and status = 'NEW'")
                    .setParameter("id", id)
                    .executeUpdate();
        } else if (user.getRole() == UserRole.TRAINER) {
            // No more renewals and no saved card; invites for new clients stop working.
            entityManager.createNativeQuery("""
                            update trainer_subscription
                            set auto_renew = false, payment_method_token = null, payment_method_title = null
                            where trainer_id = :id
                            """)
                    .setParameter("id", id)
                    .executeUpdate();
            entityManager.createNativeQuery("update invite set status = 'CANCELLED' where trainer_id = :id and status = 'NEW'")
                    .setParameter("id", id)
                    .executeUpdate();
        }

        user.setEmail("deleted-" + id + "@deleted.fitapp.local")
                .setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .setStatus(UserStatus.DELETED)
                .setFirstName("Аккаунт")
                .setLastName("удалён")
                .setPhone(null)
                .setAvatarPath(null)
                .setContractNumber(null)
                .setContractEndDate(null)
                .setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private void deleteWhere(String table, String column, Long id) {
        entityManager.createNativeQuery("delete from " + table + " where " + column + " = :id")
                .setParameter("id", id)
                .executeUpdate();
    }
}
