package ru.fitapp.backend.common.storage;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.fitapp.backend.common.exception.ApiException;

import java.io.IOException;
import java.nio.file.*;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalFileStorageService {

    private static final long MAX_AVATAR_SIZE_BYTES = 5L * 1024L * 1024L;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path uploadsRoot;
    private final Path avatarsDir;

    public LocalFileStorageService(
            @Value("${app.storage.uploads-dir:uploads}") String uploadsDir
    ) {
        this.uploadsRoot = Paths.get(uploadsDir).toAbsolutePath().normalize();
        this.avatarsDir = this.uploadsRoot.resolve("avatars").normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(avatarsDir);
        } catch (IOException e) {
            throw new IllegalStateException("Не удалось создать директорию для аватаров", e);
        }
    }

    public String storeAvatar(MultipartFile file) {
        validateAvatar(file);

        String extension = resolveExtension(file);
        String fileName = UUID.randomUUID() + extension;
        Path target = avatarsDir.resolve(fileName).normalize();

        if (!target.startsWith(avatarsDir)) {
            throw new ApiException("INVALID_FILE_PATH", "Некорректный путь для сохранения файла");
        }

        try {
            file.transferTo(target);
        } catch (IOException e) {
            throw new ApiException("FILE_UPLOAD_FAILED", "Не удалось сохранить аватар");
        }

        return "/uploads/avatars/" + fileName;
    }

    public void deleteByPublicPath(String publicPath) {
        if (publicPath == null || publicPath.isBlank()) {
            return;
        }

        Path resolved = resolvePublicPath(publicPath);

        try {
            Files.deleteIfExists(resolved);
        } catch (IOException e) {
            throw new ApiException("FILE_DELETE_FAILED", "Не удалось удалить файл аватара");
        }
    }

    private Path resolvePublicPath(String publicPath) {
        String normalized = publicPath.trim();

        if (!normalized.startsWith("/uploads/")) {
            throw new ApiException("INVALID_FILE_PATH", "Некорректный путь к файлу");
        }

        String relativeInsideUploads = normalized.substring("/uploads/".length());
        Path resolved = uploadsRoot.resolve(relativeInsideUploads).normalize();

        if (!resolved.startsWith(uploadsRoot)) {
            throw new ApiException("INVALID_FILE_PATH", "Некорректный путь к файлу");
        }

        return resolved;
    }

    private void validateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("EMPTY_FILE", "Файл аватара не выбран");
        }

        if (file.getSize() > MAX_AVATAR_SIZE_BYTES) {
            throw new ApiException("FILE_TOO_LARGE", "Размер файла не должен превышать 5 МБ");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ApiException(
                    "INVALID_FILE_TYPE",
                    "Допустимы только изображения JPG, PNG или WEBP"
            );
        }
    }

    private String resolveExtension(MultipartFile file) {
        String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "").toLowerCase();

        if (originalName.endsWith(".jpg") || originalName.endsWith(".jpeg")) {
            return ".jpg";
        }

        if (originalName.endsWith(".png")) {
            return ".png";
        }

        if (originalName.endsWith(".webp")) {
            return ".webp";
        }

        String contentType = file.getContentType();
        if ("image/jpeg".equals(contentType)) {
            return ".jpg";
        }
        if ("image/png".equals(contentType)) {
            return ".png";
        }
        if ("image/webp".equals(contentType)) {
            return ".webp";
        }

        throw new ApiException("INVALID_FILE_TYPE", "Не удалось определить расширение файла");
    }
}