package com.TryCatch.NusaCart.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

import com.TryCatch.NusaCart.security.JwtAuthenticationEntryPoint;
import com.TryCatch.NusaCart.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthEntryPoint;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**", "/error", "/favicon.ico", "/favicon.png").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/uploads/**").permitAll() // Allow access to uploaded files
                .requestMatchers("/api/toko").permitAll() // Public endpoints for viewing stores
                .requestMatchers("/api/toko/{idToko}").permitAll() // Public endpoint for viewing a specific store
                .requestMatchers("/api/toko/search").permitAll() // Public endpoint for searching stores
                .requestMatchers("/api/toko/my-stores").hasRole("SELLER")
                .requestMatchers("/api/categories").permitAll() // Public endpoint for viewing all categories
                .requestMatchers("/api/categories/{idCategory}").permitAll() // Public endpoint for viewing a specific category
                .requestMatchers("/api/categories/toko/{idToko}").permitAll() // Public endpoint for viewing categories of a specific store
                .requestMatchers("/api/categories/search").permitAll() // Public endpoint for searching categories
                .requestMatchers("/api/categories/my-categories").hasRole("SELLER") // Endpoint for seller to view their categories
                .requestMatchers("/api/payment-methods/**").permitAll() // Public endpoint for viewing payment methods
                .requestMatchers("/api/payments/**").hasAnyRole("USER", "SELLER") // Payment management endpoints
                .requestMatchers("/api/seller/register").hasRole("USER")
                .requestMatchers("/api/toko/my-stores").hasRole("SELLER") // For seller to manage their own stores
                .requestMatchers("/api/toko").hasRole("SELLER") // POST to create a store
                .requestMatchers("/api/toko/{idToko}").hasRole("SELLER") // PUT/DELETE to update/delete a store
                .requestMatchers("/api/categories").hasRole("SELLER") // POST to create a category
                .requestMatchers("/api/categories/{idCategory}").hasRole("SELLER") // PUT/DELETE to update/delete a category
                .requestMatchers("/api/images/**").hasAnyRole("USER", "SELLER") // Image upload endpoints
                .requestMatchers("/api/user/**").hasAnyRole("USER", "SELLER") // User endpoints accessible by all logged in users
                .requestMatchers("/api/products/**").permitAll() // Product endpoints accessible by all users

                //.requestMatchers("/**").permitAll() //Hapus ini ya nanti
                .anyRequest().authenticated()
            );
            
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // URL frontend Anda
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}