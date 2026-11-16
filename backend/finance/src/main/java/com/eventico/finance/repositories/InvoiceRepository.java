package com.eventico.finance.repositories;

import com.eventico.finance.entities.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumberAndSupplierName(String invoiceNumber, String supplierName);

    List<Invoice> findByIsMatchedFalse();

    List<Invoice> findByIsMatchedFalseAndIsValidTrue();

    @Query("""
            select i from Invoice i
            left join fetch i.invoiceLines
            left join fetch i.matches m
            left join fetch m.transaction
            where i.id = :id
            """)
    Optional<Invoice> findByIdWithRelations(@Param("id") Long id);
}
