package com.eventico.finance.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "transactions")
public class BankTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false, unique = true)
    private String transactionId;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "value_date")
    private LocalDate valueDate;

    @Column(name = "amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency")
    private String currency;

    @Column(name = "debtor_name")
    private String debtorName;

    @Column(name = "debtor_iban")
    private String debtorIban;

    @Column(name = "creditor_name")
    private String creditorName;

    @Column(name = "creditor_iban")
    private String creditorIban;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "remittance_info", columnDefinition = "TEXT")
    private String remittanceInfo;

    @Column(name = "end_to_end_id")
    private String endToEndId;

    @Column(name = "mandate_id")
    private String mandateId;

    @Column(name = "camt_file_name")
    private String camtFileName;

    @Column(name = "imported_at")
    private OffsetDateTime importedAt = OffsetDateTime.now();

    @Column(name = "is_matched")
    private Boolean isMatched = Boolean.FALSE;

    @Column(name = "match_confidence")
    private Double matchConfidence;
}
