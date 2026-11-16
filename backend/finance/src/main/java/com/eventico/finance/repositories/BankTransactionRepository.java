package com.eventico.finance.repositories;

import com.eventico.finance.entities.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {

    Optional<BankTransaction> findByTransactionId(String transactionId);

    List<BankTransaction> findByIsMatchedFalse();
}