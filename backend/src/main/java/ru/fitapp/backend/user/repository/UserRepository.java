package ru.fitapp.backend.user.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserStatus;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
            select u
            from AppUser u
            where u.status = :status
            order by
              case when u.lastSeenAt is null then 0 else 1 end,
              u.lastSeenAt asc
            """)
    List<AppUser> findLeastActiveUsers(UserStatus status, Pageable pageable);
}