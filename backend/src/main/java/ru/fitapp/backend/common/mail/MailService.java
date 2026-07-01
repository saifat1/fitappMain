package ru.fitapp.backend.common.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@fitapp.local}")
    private String from;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordReset(String to, String link) {
        String subject = "FitApp — восстановление пароля";
        String body = "Вы запросили восстановление пароля в FitApp.\n\n"
                + "Перейдите по ссылке, чтобы задать новый пароль:\n"
                + link + "\n\n"
                + "Ссылка действует ограниченное время. Если вы не запрашивали сброс — просто проигнорируйте письмо.";
        send(to, subject, body);
    }

    private void send(String to, String subject, String body) {
        if (!mailEnabled) {
            // Dev / no-SMTP mode: surface the link in logs so the flow is testable.
            log.info("[MAIL DISABLED] To: {} | Subject: {}\n{}", to, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            // Never break the user-facing flow because mail delivery failed.
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
