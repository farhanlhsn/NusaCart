package com.TryCatch.NusaCart.security;

import java.io.IOException;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

// Import exceptions to catch
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
// IllegalArgumentException juga bisa ditambahkan jika diperlukan untuk penanganan error token dari jjwt

import com.TryCatch.NusaCart.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        try {
            // 1. Ekstrak token dari request
            String token = jwtUtil.getTokenFromRequest(request);
            
            // 2. Validasi token (jwtUtil.validateToken akan throw exception jika tidak valid)
            if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
                // 3. Ekstrak id dari token
                Integer userId = jwtUtil.getUserIdFromToken(token);
                
                // 4. Load user dari database 
                userRepository.findByUserId(userId).ifPresent(user -> {
                    // 5. Pastikan user login status true (tambahan validasi)
                    if (!user.isLogin()) {
                        log.warn("User {} is not logged in, denying authentication.", user.getEmail());
                        // Jika user status tidak login, jangan authenticate
                        return; 
                    }
                    
                    // Log roles for debugging
                    log.debug("User {} has roles: {}", user.getEmail(), user.getRoles());
                    
                    // 6. Buat objek Authentication
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            user.getRoles().stream()
                                .map(role -> {
                                    String roleName = "ROLE_" + role.name();
                                    log.debug("Setting role: {}", roleName);
                                    return new SimpleGrantedAuthority(roleName);
                                })
                                .collect(Collectors.toList())
                        );
                    
                    // 7. Set detail dari request
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 8. Set Authentication ke Security Context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Authentication set for user: {} with roles: {}", user.getEmail(), user.getRoles());
                });
            }
        } catch (AuthenticationCredentialsNotFoundException e) { // Tangkap exception yang muncul di log Anda
            log.warn("Authentication credentials not found or token issue (e.g., expired): {} for request URI: {}", e.getMessage(), request.getRequestURI());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Authentication failed or token expired\", \"message\": \"" + e.getMessage() + "\"}");
            response.setContentType("application/json");
            return; // Hentikan filter chain
        } catch (ExpiredJwtException e) { // Untuk kasus jika JwtUtil melemparkan ExpiredJwtException secara langsung
            log.warn("JWT token has explicitly expired: {} for request URI: {}", e.getMessage(), request.getRequestURI());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"JWT token has expired\", \"message\": \"" + e.getMessage() + "\"}");
            response.setContentType("application/json");
            return; // Hentikan filter chain
        } catch (SignatureException | MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            // IllegalArgumentException dapat dilemparkan oleh JJWT untuk berbagai masalah parsing.
            log.warn("Invalid JWT token (Signature/Malformed/Unsupported/Argument): {} for request URI: {}", e.getMessage(), request.getRequestURI());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Invalid JWT token\", \"message\": \"" + e.getMessage() + "\"}");
            response.setContentType("application/json");
            return; // Hentikan filter chain
        } 
        // Blok catch (Exception e) generik yang lama telah digantikan oleh blok-blok spesifik di atas
        // untuk menangani error validasi token.
        
        // 9. Lanjutkan ke filter berikutnya jika tidak ada JWT exception yang menghentikan chain
        filterChain.doFilter(request, response);
    }
}