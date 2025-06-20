package com.yourdomain.personalfinance.repository;

import com.yourdomain.personalfinance.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Find all categories belonging to a specific user
    List<Category> findByUserId(Long userId);

    // Find a specific category by its ID and user ID (to ensure ownership)
    Optional<Category> findByIdAndUserId(Long id, Long userId);

    // Check if a category with a given name already exists for a specific user
    boolean existsByNameAndUserId(String name, Long userId);

    // You can add other custom methods, e.g., for searching by name for a user:
    // List<Category> findByNameContainingIgnoreCaseAndUserId(String name, Long userId);
}
