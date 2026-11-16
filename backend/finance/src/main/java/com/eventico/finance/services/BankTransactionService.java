package com.eventico.finance.services;


import com.eventico.finance.dtos.BankTransactionDto;

import java.util.List;

public interface BankTransactionService {
    List<BankTransactionDto> listTransactions();
}