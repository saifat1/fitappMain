package ru.fitapp.backend.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class StaticResourceWebConfig implements WebMvcConfigurer {

    private final String uploadsDir;

    public StaticResourceWebConfig(
            @Value("${app.storage.uploads-dir:uploads}") String uploadsDir
    ) {
        this.uploadsDir = uploadsDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absoluteUploadsPath = Paths.get(uploadsDir)
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();

        if (!absoluteUploadsPath.endsWith("/")) {
            absoluteUploadsPath = absoluteUploadsPath + "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(absoluteUploadsPath);
    }
}