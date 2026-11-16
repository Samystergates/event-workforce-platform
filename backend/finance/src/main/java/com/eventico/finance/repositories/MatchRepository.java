package com.eventico.finance.repositories;

import com.eventico.finance.entities.MatchRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MatchRepository extends JpaRepository<MatchRecord, Long> {


    @Query("""
            select m from MatchRecord m
            left join fetch m.invoice inv
            left join fetch m.transaction tx
            where inv.id = :invoiceId
            order by m.createdAt desc
            """)
    List<MatchRecord> findByInvoiceIdWithDetails(@Param("invoiceId") Long invoiceId);

}