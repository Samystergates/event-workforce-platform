package com.eventico.finance.entities;

import com.eventico.finance.utilities.MatchStatus;
import com.eventico.finance.utilities.MatchType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "matches", uniqueConstraints = @UniqueConstraint(name = "uq_invoice_transaction", columnNames = {"invoice_id", "transaction_id"}))
public class MatchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private BankTransaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", nullable = false)
    private MatchStatus matchStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_type", nullable = false)
    private MatchType matchType;

    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore;

    @Column(name = "matched_on_amount")
    private Boolean matchedOnAmount;

    @Column(name = "matched_on_iban")
    private Boolean matchedOnIban;

    @Column(name = "matched_on_reference")
    private Boolean matchedOnReference;

    @Column(name = "matched_on_date_range")
    private Boolean matchedOnDateRange;

    @Column(name = "matched_amount", precision = 18, scale = 2)
    private BigDecimal matchedAmount;

    @Column(name = "is_partial_payment")
    private Boolean partialPayment;

    @Column(name = "payment_group_id")
    private String paymentGroupId;

    @Column(name = "confirmed_by_user")
    private String confirmedByUser;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}