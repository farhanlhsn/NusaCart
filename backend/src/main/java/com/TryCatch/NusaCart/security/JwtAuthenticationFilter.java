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
            
            // 2. Validasi token
            if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
                // 3. Ekstrak id dari token
                Integer userId = jwtUtil.getUserIdFromToken(token);
                
                // 4. Load user dari database 
                userRepository.findByUserId(userId).ifPresent(user -> {
                    // 5. Pastikan user login status true (tambahan validasi)
                    if (!user.isLogin()) {
                        log.warn("User {} is not logged in", user.getEmail());
                        return; // Jika user status tidak login, jangan authenticate
                    }
                    
                    // Log roles for debugging
                    log.info("User {} has roles: {}", user.getEmail(), user.getRoles());
                    
                    // 6. Buat objek Authentication
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            user.getRoles().stream()
                                .map(role -> {
                                    String roleName = "ROLE_" + role.name();
                                    log.info("Setting role: {}", roleName);
                                    return new SimpleGrantedAuthority(roleName);
                                })
                                .collect(Collectors.toList())
                        );
                    
                    // 7. Set detail dari request
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 8. Set Authentication ke Security Context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info("Authentication set for user: {} with roles: {}", user.getEmail(), user.getRoles());
                });
            }
        } catch (Exception e) {
            log.info("Could not set authentication in security context", e);
        }
        
        // 9. Lanjutkan ke filter berikutnya
        filterChain.doFilter(request, response);
    }
}