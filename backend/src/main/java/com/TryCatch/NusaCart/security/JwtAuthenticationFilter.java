package com.TryCatch.NusaCart.security;

import java.io.IOException;

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

import java.util.Collections;
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
                // 3. Ekstrak email dari token
                String email = jwtUtil.getEmailFromToken(token);
                
                // 4. Load user dari database 
                userRepository.findByEmail(email).ifPresent(user -> {
                    // 5. Buat objek Authentication
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                        );
                    
                    // 6. Set detail dari request
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 7. Set Authentication ke Security Context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                });
            }
        } catch (Exception e) {
            log.info("Could not set authentication in security context", e);
        }
        
        // 8. Lanjutkan ke filter berikutnya
        filterChain.doFilter(request, response);
    }
}