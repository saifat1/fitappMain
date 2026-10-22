package ru.fitapp.backend.auth.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.stream.Stream;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/ping",
                                "/api/auth/login",
                                "/api/auth/register-by-invite",
                                "/api/auth/register-trainer",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/invites/**",
                                "/api/payments/notifications/**",
                                // logout in the store app: the device token alone identifies what to forget (FIT-69)
                                "/api/push/devices/remove",
                                "/api/public/**",
                                "/uploads/**"
                        ).permitAll()
                        .requestMatchers("/api/trainer/**").hasRole("TRAINER")
                        .requestMatchers("/api/client/**").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/trainings/**").hasAnyRole("TRAINER", "CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/trainings/**").hasRole("TRAINER")
                        .requestMatchers(HttpMethod.PUT, "/api/trainings/**").hasRole("TRAINER")
                        .requestMatchers(HttpMethod.PATCH, "/api/trainings/**").hasRole("TRAINER")
                        .requestMatchers(HttpMethod.DELETE, "/api/trainings/**").hasRole("TRAINER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * The stand's own address (APP_PUBLIC_BASE_URL) is allowed too, so a new server needs only .env, not a code patch.
     * APP_EXTRA_ORIGINS (comma-separated) keeps an old address working after a move to a new domain.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.public-base-url:http://localhost:3000}") String publicBaseUrl,
            @Value("${app.cors.extra-origins:}") String extraOrigins
    ) {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Stream.concat(
                Stream.of(
                        "http://localhost:3000",
                        "http://localhost:5174",
                        "http://localhost:5173",
                        "http://89.111.137.65:8081",
                        "http://89-111-137-65.swtest.ru:8081",
                        "https://89-111-137-65.swtest.ru",
                        "https://89.111.137.65",
                        // Store app (Capacitor): Android serves the bundled page from https://localhost, iOS from capacitor://localhost
                        "https://localhost",
                        "capacitor://localhost",
                        publicBaseUrl
                ),
                Stream.of(extraOrigins.split(","))
        ).map(origin -> origin.trim().replaceAll("/+$", "")).filter(origin -> !origin.isEmpty()).distinct().toList());

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
