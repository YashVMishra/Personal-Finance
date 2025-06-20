package com.yourdomain.personalfinance.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import java.math.BigDecimal;

@Entity
@Table(name = "budgets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "category_id", "budget_year", "budget_month"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "category"})
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "budget_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount; // Budgeted amount for the month

    @Column(name = "budget_year", nullable = false)
    private int year; // e.g., 2024

    @Column(name = "budget_month", nullable = false) // 1 for January, 12 for December
    private int month;

    // Custom constructor if needed
    public Budget(User user, Category category, BigDecimal amount, int year, int month) {
        this.user = user;
        this.category = category;
        this.amount = amount;
        this.year = year;
        this.month = month;
    }
}
