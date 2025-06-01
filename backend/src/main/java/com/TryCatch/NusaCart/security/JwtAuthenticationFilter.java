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
import jakarta.servlet.http.Cookie;

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
        
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        log.info("=== JWT Filter Processing: {} {} ===", method, requestURI);
        
        // Skip JWT processing for public endpoints
        if (isPublicEndpoint(requestURI)) {
            log.debug("Skipping JWT authentication for public endpoint: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        log.debug("Processing JWT authentication for: {}", requestURI);
        
        // Debug: Print all cookies
        if (request.getCookies() != null) {
            log.debug("Available cookies:");
            for (Cookie cookie : request.getCookies()) {
                log.debug("Cookie: {} = {}", cookie.getName(), cookie.getValue().length() > 20 ? cookie.getValue().substring(0, 20) + "..." : cookie.getValue());
            }
        } else {
            log.debug("No cookies found in request");
        }
            
        try {
            // 1. HANYA ekstrak token dari cookies, bukan dari header
            String token = getTokenFromCookie(request, "access_token");
            log.debug("Token from cookie: {}", token != null ? "Present (length: " + token.length() + ")" : "Not found");
            
            // 2. Validasi token (jwtUtil.validateToken akan throw exception jika tidak valid)
            if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
                log.debug("Token validated successfully");
                
                // 3. Ekstrak id dari token
                Integer userId = jwtUtil.getUserIdFromToken(token);
                log.debug("User ID from token: {}", userId);
                
                // 4. Load user dari database 
                userRepository.findByUserId(userId).ifPresent(user -> {
                    log.debug("User found in database: {}", user.getEmail());
                    
                    // 5. Pastikan user login status true (tambahan validasi)
                    if (!user.isLogin()) {
                        log.warn("User {} is not logged in, denying authentication.", user.getEmail());
                        // Jika user status tidak login, jangan authenticate
                        return; 
                    }
                    
                    log.debug("User {} login status is true, proceeding with authentication", user.getEmail());
                    
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
                    log.info("✅ Authentication successfully set for user: {} for URI: {}", user.getEmail(), requestURI);
                });
            } else {
                log.debug("No valid token found for request: {}", requestURI);
            }
        } catch (AuthenticationCredentialsNotFoundException e) {
            log.warn("Authentication credentials not found or token issue (e.g., expired): {} for request URI: {}", e.getMessage(), request.getRequestURI());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Authentication failed or token expired\", \"message\": \"" + e.getMessage() + "\"}");
            response.setContentType("application/json");
            return; // Hentikan filter chain
        } catch (ExpiredJwtException e) {
            log.warn("JWT token has explicitly expired: {} for request URI: {}", e.getMessage(), request.getRequestURI());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"JWT token has expired\", \"message\": \"" + e.getMessage() + "\"}");
            response.setContentType("application/json");
            return; // Hentikan filter chain
        } catch (SignatureException | MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token (Signature/Malformed/Unsupported/Argument): {} for request URI: {}", e.getMessage(), request.getRequestURI());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Invalid JWT token\", \"message\": \"" + e.getMessage() + "\"}");
            response.setContentType("application/json");
            return; // Hentikan filter chain
        }
        
        log.debug("=== JWT Filter Completed for: {} {} ===", method, requestURI);
        
        // Lanjutkan filter chain
        filterChain.doFilter(request, response);
    }
    
    /**
     * Check if the request URI is a public endpoint that doesn't need JWT processing
     */
    private boolean isPublicEndpoint(String requestURI) {
        // Logout memerlukan authentication, jadi tidak boleh di-skip
        if (requestURI.equals("/api/auth/logout")) {
            return false;
        }
        
        return requestURI.startsWith("/api/auth/") ||
               requestURI.equals("/error") ||
               requestURI.equals("/favicon.ico") ||
               requestURI.startsWith("/api/public/");
    }
    
    /**
     * Helper method untuk ambil token dari cookie
     */
    private String getTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}