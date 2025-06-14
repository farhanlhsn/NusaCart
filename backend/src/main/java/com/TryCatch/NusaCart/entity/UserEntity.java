package com.TryCatch.NusaCart.entity;

import java.time.LocalDateTime;

import com.TryCatch.NusaCart.enums.UserRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "users") 
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String name;

    @Column(unique = true, length = 64, nullable = false)
    private String email;
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<UserRole> roles = new HashSet<>(); 

    @Column(name = "registered_date", nullable = false, updatable = false) 
    private LocalDateTime registeredDate;

    @Column(name = "is_login")
    private boolean isLogin;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    private String profilePicture;

    @Column(name = "phone_number", unique = true, nullable = false)
    private String phoneNumber;

    // --- JPA Callback Method ---
    @PrePersist
    protected void onCreate() {
        this.registeredDate = LocalDateTime.now();
        this.isLogin = false;
    }

    public void addRole(UserRole role) {
        roles.add(role);
    }

    public void removeRole(UserRole role) {
        roles.remove(role);
    }

}