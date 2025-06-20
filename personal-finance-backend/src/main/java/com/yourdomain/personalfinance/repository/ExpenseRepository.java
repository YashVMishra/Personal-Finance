package com.yourdomain.personalfinance.repository;

import com.yourdomain.personalfinance.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {

    // Find all expenses for a specific user, with pagination
    Page<Expense> findByUserId(Long userId, Pageable pageable);

    // Find a specific expense by its ID and user ID (to ensure ownership)
    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    // Find expenses for a user within a date range
    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    // Find expenses for a user by category
    List<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId);

    // Example of a more complex query using @Query for SUM or specific aggregations
    // This is useful for dashboard/reporting features
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId")
    Optional<BigDecimal> sumTotalAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date >= :startDate AND e.date <= :endDate")
    Optional<BigDecimal> sumTotalAmountByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category.id as categoryId, SUM(e.amount) as totalAmount " +
           "FROM Expense e " +
           "WHERE e.user.id = :userId AND e.date >= :startDate AND e.date <= :endDate " +
           "GROUP BY e.category.id")
    List<CategoryExpenseSummary> sumExpensesByCategoryForUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Interface for the projection
    interface CategoryExpenseSummary {
        Long getCategoryId();
        BigDecimal getTotalAmount();
    }

    // JpaSpecificationExecutor is added to allow dynamic query building using Criteria API
    // This is very useful for handling multiple optional filters (search term, category, date range etc.)
    // from the frontend in a clean way in the service layer.
}
