package com.eventico.finance.services.implementations;

import com.eventico.finance.dtos.BankTransactionDto;
import com.eventico.finance.dtos.FinanceDtoMapper;
import com.eventico.finance.repositories.BankTransactionRepository;
import com.eventico.finance.services.BankTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankTransactionServiceImp implements BankTransactionService {

    private final BankTransactionRepository bankTransactionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BankTransactionDto> listTransactions() {
        return bankTransactionRepository.findAll().stream()
                .map(FinanceDtoMapper::toBankTransactionDto)
                .collect(Collectors.toList());
    }
}
