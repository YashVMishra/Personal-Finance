package com.yourdomain.personalfinance.repository;

import com.yourdomain.personalfinance.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Find budgets for a specific user
    List<Budget> findByUserId(Long userId);

    // Find budgets for a specific user and year
    List<Budget> findByUserIdAndYear(Long userId, int year);

    // Find budgets for a specific user, year, and month
    List<Budget> findByUserIdAndYearAndMonth(Long userId, int year, int month);

    // Find a specific budget entry by user, category, year, and month (useful for updates)
    Optional<Budget> findByUserIdAndCategoryIdAndYearAndMonth(Long userId, Long categoryId, int year, int month);

    // Find a budget by its ID and user ID (to ensure ownership)
    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    // Example: Sum of all budgeted amounts for a user in a specific month and year
    @Query("SELECT SUM(b.amount) FROM Budget b WHERE b.user.id = :userId AND b.year = :year AND b.month = :month")
    Optional<java.math.BigDecimal> sumTotalBudgetByUserIdAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month
    );
}
