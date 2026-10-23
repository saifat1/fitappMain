package ru.fitapp.backend.feedback.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.fitapp.backend.feedback.entity.Feedback;
import ru.fitapp.backend.feedback.model.FeedbackStatus;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("select f from Feedback f join fetch f.user order by f.createdAt desc")
    List<Feedback> findAllWithUser();

    @Query("select f from Feedback f join fetch f.user where f.status = :status order by f.createdAt desc")
    List<Feedback> findAllWithUserByStatus(FeedbackStatus status);
}
