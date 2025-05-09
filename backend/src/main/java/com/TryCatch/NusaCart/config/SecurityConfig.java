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
            .cors(cors -> cors.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**", "/error", "/favicon.ico").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/toko").permitAll() // Public endpoints for viewing stores
                .requestMatchers("/api/toko/{idToko}").permitAll() // Public endpoint for viewing a specific store
                .requestMatchers("/api/toko/search").permitAll() // Public endpoint for searching stores
                .requestMatchers("/api/seller/register").hasRole("USER")
                .requestMatchers("/api/toko/my-stores").hasRole("SELLER") // For seller to manage their own stores
                .requestMatchers("/api/toko").hasRole("SELLER") // POST to create a store
                .requestMatchers("/api/toko/{idToko}").hasRole("SELLER") // PUT/DELETE to update/delete a store
                .requestMatchers("/api/user/**").hasAnyRole("USER", "SELLER") // User endpoints accessible by all logged in users
                .requestMatchers("/**").permitAll() //Hapus ini ya nanti
                .anyRequest().authenticated()
            );
            
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}