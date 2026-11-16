package com.eventico.finance.entities;

import com.eventico.finance.utilities.InvoiceType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", nullable = false)
    private String invoiceNumber;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_type", nullable = false)
    private InvoiceType invoiceType = InvoiceType.PAYABLE;

    @Column(name = "supplier_name", nullable = false)
    private String supplierName;

    @Column(name = "supplier_address")
    private String supplierAddress;

    @Column(name = "supplier_postal_code")
    private String supplierPostalCode;

    @Column(name = "supplier_city")
    private String supplierCity;

    @Column(name = "supplier_country")
    private String supplierCountry;

    @Column(name = "supplier_vat_number")
    private String supplierVatNumber;

    @Column(name = "supplier_kvk_number")
    private String supplierKvkNumber;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_address")
    private String customerAddress;

    @Column(name = "customer_postal_code")
    private String customerPostalCode;

    @Column(name = "customer_city")
    private String customerCity;

    @Column(name = "customer_country")
    private String customerCountry;

    @Column(name = "customer_vat_number")
    private String customerVatNumber;

    @Column(name = "customer_reference")
    private String customerReference;

    @Column(name = "amount_excl_vat", precision = 18, scale = 2)
    private BigDecimal amountExclVat;

    @Column(name = "vat_amount", precision = 18, scale = 2)
    private BigDecimal vatAmount;

    @Column(name = "amount_incl_vat", precision = 18, scale = 2)
    private BigDecimal amountInclVat;

    @Column(name = "currency")
    private String currency = "EUR";

    @Column(name = "vat_percentage", precision = 18, scale = 4)
    private BigDecimal vatPercentage;

    @Column(name = "vat_reverse_charge")
    private Boolean vatReverseCharge = Boolean.FALSE;

    @Column(name = "vat_specification", columnDefinition = "TEXT")
    private String vatSpecification;

    @Column(name = "supplier_iban")
    private String supplierIban;

    @Column(name = "supplier_bic")
    private String supplierBic;

    @Column(name = "payment_terms")
    private String paymentTerms;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "pdf_file_path", nullable = false)
    private String pdfFilePath;

    @Column(name = "pdf_file_hash", nullable = false)
    private String pdfFileHash;

    @Column(name = "pdf_text_content", columnDefinition = "TEXT")
    private String pdfTextContent;

    @Column(name = "email_message_id")
    private String emailMessageId;

    @Column(name = "email_folder")
    private String emailFolder;

    @Column(name = "email_sender")
    private String emailSender;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "extraction_confidence")
    private Double extractionConfidence;

    @Column(name = "extraction_method")
    private String extractionMethod;

    @Column(name = "type_detection_method")
    private String typeDetectionMethod;

    @Column(name = "extraction_warnings", columnDefinition = "TEXT")
    private String extractionWarnings;

    @Column(name = "validation_errors", columnDefinition = "TEXT")
    private String validationErrors;

    @Column(name = "missing_required_fields", columnDefinition = "TEXT")
    private String missingRequiredFields;

    @Column(name = "is_valid")
    private Boolean isValid = Boolean.TRUE;

    @Column(name = "is_matched")
    private Boolean isMatched = Boolean.FALSE;

    @Column(name = "is_paid")
    private Boolean isPaid = Boolean.FALSE;

    @Column(name = "imported_at")
    private OffsetDateTime importedAt = OffsetDateTime.now();

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "description_summary", columnDefinition = "TEXT")
    private String descriptionSummary;

    @Column(name = "service_period_start")
    private LocalDate servicePeriodStart;

    @Column(name = "service_period_end")
    private LocalDate servicePeriodEnd;

    @Column(name = "purchase_order_number")
    private String purchaseOrderNumber;

    @Column(name = "project_reference")
    private String projectReference;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceLine> invoiceLines = new ArrayList<>();

    @OneToMany(mappedBy = "invoice")
    private List<MatchRecord> matches = new ArrayList<>();

    public void addLine(InvoiceLine line) {
        line.setInvoice(this);
        invoiceLines.add(line);
    }
}