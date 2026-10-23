package ru.fitapp.backend.common.monitoring;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

/**
 * FIT-74: which build of the backend answers — shown under the app version in the profile.
 * BUILD_COMMIT is the last commit that touched backend/ (deploy/release.sh); no auth, nothing secret.
 */
@RestController
@RequestMapping("/api/public")
public class PublicVersionController {

    public record VersionResponse(String commit, Instant startedAt) {
    }

    private final VersionResponse version;

    public PublicVersionController(@Value("${app.build-commit:dev}") String commit) {
        this.version = new VersionResponse(commit.isBlank() ? "dev" : commit.trim(), Instant.now());
    }

    @GetMapping("/version")
    public VersionResponse version() {
        return version;
    }
}
