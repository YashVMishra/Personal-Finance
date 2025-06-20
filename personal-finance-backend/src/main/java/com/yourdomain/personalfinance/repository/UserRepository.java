package com.yourdomain.personalfinance.repository;

import com.yourdomain.personalfinance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Method to find a user by their email
    // Spring Data JPA will automatically generate the query based on the method name
    Optional<User> findByEmail(String email);

    // Method to check if a user exists by their email
    // Useful for registration to prevent duplicate emails
    Boolean existsByEmail(String email);

    // You can add other custom query methods here if needed, for example:
    // List<User> findByNameContainingIgnoreCase(String name);
}
