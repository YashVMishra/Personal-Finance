package com.yourdomain.personalfinance.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "expenses", "budgets"})
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String color; // e.g., hex code like "#FF5733"

    @Column(name = "default_budget")
    private Double defaultBudget; // Optional: default monthly budget for this category

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Expense> expenses = new HashSet<>();

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Budget> budgets = new HashSet<>();

    // Custom constructor if needed
    public Category(String name, String color, User user, Double defaultBudget) {
        this.name = name;
        this.color = color;
        this.user = user;
        this.defaultBudget = defaultBudget;
    }
}
