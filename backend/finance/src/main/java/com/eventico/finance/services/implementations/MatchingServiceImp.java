package com.eventico.finance.services.implementations;

import com.eventico.finance.dtos.FinanceDtoMapper;
import com.eventico.finance.dtos.ManualMatchRequest;
import com.eventico.finance.dtos.MatchRecordDto;
import com.eventico.finance.dtos.MatchingSummaryDto;
import com.eventico.finance.entities.BankTransaction;
import com.eventico.finance.entities.Invoice;
import com.eventico.finance.entities.MatchRecord;
import com.eventico.finance.repositories.BankTransactionRepository;
import com.eventico.finance.repositories.InvoiceRepository;
import com.eventico.finance.repositories.MatchRepository;
import com.eventico.finance.services.MatchingService;
import com.eventico.finance.services.matchers.ConfidenceCalculator;
import com.eventico.finance.services.matchers.MultiInvoiceMatcher;
import com.eventico.finance.utilities.MatchStatus;
import com.eventico.finance.utilities.MatchType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingServiceImp implements MatchingService {

    private final InvoiceRepository invoiceRepository;
    private final BankTransactionRepository transactionRepository;
    private final MatchRepository matchRepository;
    private final ConfidenceCalculator calculator;
    private final MultiInvoiceMatcher multiInvoiceMatcher;

    @Transactional
    @Override
    public MatchingSummaryDto runAutoMatching() {
        List<Invoice> invoices = invoiceRepository.findByIsMatchedFalseAndIsValidTrue();
        List<BankTransaction> transactions = transactionRepository.findByIsMatchedFalse();

        int confirmed = 0;
        int suggested = 0;
        int multi = 0;

        for (BankTransaction transaction : transactions) {
            List<Invoice> multiInvoices = multiInvoiceMatcher.resolve(transaction, invoices);
            if (!multiInvoices.isEmpty()) {
                multi++;
                multiInvoices.forEach(invoice -> confirmMatch(transaction, invoice, 0.9, true, transaction.getAmount().abs()));
                continue;
            }

            double bestScore = 0.0;
            Invoice bestMatch = null;
            for (Invoice invoice : invoices) {
                double score = calculator.calculate(transaction, invoice);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = invoice;
                }
            }
            if (bestMatch != null) {
                if (bestScore >= 0.85) {
                    confirmMatch(transaction, bestMatch, bestScore, false, bestMatch.getAmountInclVat());
                    confirmed++;
                } else if (bestScore >= 0.45) {
                    suggestMatch(transaction, bestMatch, bestScore);
                    suggested++;
                }
            }
        }
        return new MatchingSummaryDto(confirmed, suggested, multi, 0);
    }

    @Transactional
    @Override
    public MatchRecord createManualMatch(ManualMatchRequest request, String user) {
        BankTransaction transaction = transactionRepository.findById(request.transactionId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        Invoice invoice = invoiceRepository.findById(request.invoiceId())
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));

        MatchRecord match = new MatchRecord();
        match.setTransaction(transaction);
        match.setInvoice(invoice);
        match.setMatchStatus(MatchStatus.CONFIRMED);
        match.setMatchType(MatchType.MANUAL);
        match.setConfidenceScore(1.0);
        match.setMatchedOnAmount(Boolean.TRUE);
        match.setMatchedOnReference(Boolean.TRUE);
        match.setMatchedOnIban(Boolean.TRUE);
        match.setMatchedOnDateRange(Boolean.TRUE);
        match.setMatchedAmount(invoice.getAmountInclVat());
        match.setPartialPayment(Boolean.FALSE);
        match.setConfirmedByUser(user);
        match.setConfirmedAt(OffsetDateTime.now());
        match.setNotes(request.notes());
        matchRepository.save(match);

        transaction.setIsMatched(Boolean.TRUE);
        transaction.setMatchConfidence(1.0);
        invoice.setIsMatched(Boolean.TRUE);
        return match;
    }

    @Transactional(readOnly = true)
    @Override
    public List<MatchRecordDto> listMatchesForInvoice(Long invoiceId) {
        return matchRepository.findByInvoiceIdWithDetails(invoiceId).stream()
                .map(FinanceDtoMapper::toMatchRecordDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public MatchRecordDto confirmMatch(Long matchId) {
        MatchRecord match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + matchId));
        match.setMatchStatus(MatchStatus.CONFIRMED);
        match.setConfirmedAt(OffsetDateTime.now());
        matchRepository.save(match);

        Invoice invoice = match.getInvoice();
        BankTransaction transaction = match.getTransaction();
        if (invoice != null) {
            invoice.setIsMatched(Boolean.TRUE);
            invoiceRepository.save(invoice);
        }
        if (transaction != null) {
            transaction.setIsMatched(Boolean.TRUE);
            transaction.setMatchConfidence(match.getConfidenceScore());
            transactionRepository.save(transaction);
        }
        return FinanceDtoMapper.toMatchRecordDto(match);
    }

    @Transactional
    @Override
    public MatchRecordDto rejectMatch(Long matchId) {
        MatchRecord match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + matchId));
        match.setMatchStatus(MatchStatus.REJECTED);
        matchRepository.save(match);

        Invoice invoice = match.getInvoice();
        BankTransaction transaction = match.getTransaction();
        if (invoice != null && Boolean.TRUE.equals(invoice.getIsMatched())) {
            invoice.setIsMatched(Boolean.FALSE);
            invoiceRepository.save(invoice);
        }
        if (transaction != null && Boolean.TRUE.equals(transaction.getIsMatched())) {
            transaction.setIsMatched(Boolean.FALSE);
            transaction.setMatchConfidence(null);
            transactionRepository.save(transaction);
        }
        return FinanceDtoMapper.toMatchRecordDto(match);
    }

    @Transactional
    @Override
    public void deleteMatch(Long matchId) {
        MatchRecord match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + matchId));
        MatchStatus status = match.getMatchStatus();

        Invoice invoice = match.getInvoice();
        BankTransaction transaction = match.getTransaction();

        matchRepository.delete(match);

        if (invoice != null && status == MatchStatus.CONFIRMED) {
            invoice.setIsMatched(Boolean.FALSE);
            invoiceRepository.save(invoice);
        }
        if (transaction != null && status == MatchStatus.CONFIRMED) {
            transaction.setIsMatched(Boolean.FALSE);
            transaction.setMatchConfidence(null);
            transactionRepository.save(transaction);
        }
    }

    private void confirmMatch(BankTransaction transaction, Invoice invoice, double score, boolean multiInvoice, java.math.BigDecimal amount) {
        MatchRecord match = new MatchRecord();
        match.setTransaction(transaction);
        match.setInvoice(invoice);
        match.setMatchStatus(MatchStatus.CONFIRMED);
        match.setMatchType(MatchType.AUTOMATIC);
        match.setConfidenceScore(score);
        match.setMatchedOnAmount(Boolean.TRUE);
        match.setMatchedOnReference(Boolean.TRUE);
        match.setMatchedOnIban(Boolean.TRUE);
        match.setMatchedOnDateRange(Boolean.TRUE);
        match.setMatchedAmount(amount);
        match.setPartialPayment(multiInvoice);
        matchRepository.save(match);

        transaction.setIsMatched(Boolean.TRUE);
        transaction.setMatchConfidence(score);
        invoice.setIsMatched(Boolean.TRUE);
    }

    private void suggestMatch(BankTransaction transaction, Invoice invoice, double score) {
        MatchRecord match = new MatchRecord();
        match.setTransaction(transaction);
        match.setInvoice(invoice);
        match.setMatchStatus(MatchStatus.SUGGESTED);
        match.setMatchType(MatchType.AUTOMATIC);
        match.setConfidenceScore(score);
        matchRepository.save(match);
    }
}
