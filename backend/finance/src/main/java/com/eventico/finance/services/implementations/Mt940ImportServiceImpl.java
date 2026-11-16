package com.eventico.finance.services.implementations;

import com.eventico.finance.dtos.BankImportResponse;
import com.eventico.finance.entities.BankTransaction;
import com.eventico.finance.repositories.BankTransactionRepository;
import com.eventico.finance.services.Mt940ImportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class Mt940ImportServiceImpl implements Mt940ImportService {

    private static final DateTimeFormatter VALUE_DATE_FMT = DateTimeFormatter.ofPattern("yyMMdd");
    private static final Pattern LINE_61 = Pattern.compile(
            "(\\d{6})(\\d{4})?([CD])([0-9.,]+)([A-Z]{1,2})(.*)");
    private static final Pattern IBAN_TAG = Pattern.compile("/IBAN/([^/]+)");
    private static final Pattern NAME_TAG = Pattern.compile("/NAME/([^/]+)");
    private static final Pattern BIC_TAG = Pattern.compile("/BIC/([^/]+)");

    private final BankTransactionRepository transactionRepository;

    @Override
    @Transactional
    public BankImportResponse importFile(MultipartFile file) {
        int parsed = 0;
        int saved = 0;
        int duplicates = 0;

        try (BufferedReader reader =
                     new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            List<Mt940TransactionRecord> records = Mt940Parser.parse(reader);
            parsed = records.size();

            for (Mt940TransactionRecord record : records) {
                String signature = DigestUtils.sha256Hex(
                        Objects.toString(record.getValueDate(), "") + ":" +
                                record.getAmount() + ":" +
                                StringUtils.defaultString(record.getCounterpartyAccount()) + ":" +
                                record.getRemittance());

                if (transactionRepository.findByTransactionId(signature).isPresent()) {
                    duplicates++;
                    continue;
                }

                BankTransaction entity = new BankTransaction();
                entity.setTransactionId(signature);
                entity.setBookingDate(record.getBookingDate());
                entity.setValueDate(record.getValueDate());
                entity.setAmount(record.getAmount());
                entity.setCurrency(record.getCurrency());
                entity.setDescription(record.getNarrative());
                entity.setRemittanceInfo(record.getRemittance());
                entity.setCamtFileName(file.getOriginalFilename());

                if (record.getDebitCredit() == 'D') {
                    entity.setDebtorIban(record.getOwnAccount());
                    entity.setCreditorIban(record.getCounterpartyAccount());
                    entity.setCreditorName(record.getCounterpartyName());
                } else {
                    entity.setDebtorIban(record.getCounterpartyAccount());
                    entity.setDebtorName(record.getCounterpartyName());
                    entity.setCreditorIban(record.getOwnAccount());
                }

                transactionRepository.save(entity);
                saved++;
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to parse MT940 file", ex);
        }

        return new BankImportResponse(file.getOriginalFilename(), parsed, saved, duplicates);
    }

    /* --- Simple MT940 parser --- */
    private static final class Mt940Parser {

        static List<Mt940TransactionRecord> parse(BufferedReader reader) throws Exception {
            List<Mt940TransactionRecord> records = new ArrayList<>();

            String line;
            String ownAccount = null;
            Mt940TransactionRecord current = null;
            StringBuilder remittanceBuffer = new StringBuilder();

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) {
                    continue;
                }

                if (line.startsWith(":25:")) {
                    ownAccount = line.substring(4).trim();
                } else if (line.startsWith(":61:")) {
                    if (current != null) {
                        current.setRemittance(remittanceBuffer.toString().trim());
                        enrichCounterparty(current);
                        records.add(current);
                        remittanceBuffer.setLength(0);
                    }
                    current = startTransaction(line.substring(4), ownAccount);
                } else if (line.startsWith(":86:")) {
                    if (current != null) {
                        if (remittanceBuffer.length() > 0) {
                            remittanceBuffer.append('\n');
                        }
                        remittanceBuffer.append(line.substring(4));
                    }
                } else if (current != null && !line.startsWith(":")) {
                    if (remittanceBuffer.length() > 0) {
                        remittanceBuffer.append('\n');
                    }
                    remittanceBuffer.append(line);
                }
            }

            if (current != null) {
                current.setRemittance(remittanceBuffer.toString().trim());
                enrichCounterparty(current);
                records.add(current);
            }
            return records;
        }

        private static Mt940TransactionRecord startTransaction(String body, String ownAccount) {
            Matcher matcher = LINE_61.matcher(body);
            if (!matcher.matches()) {
                throw new IllegalArgumentException("Unrecognized :61: line: " + body);
            }

            String valueDateStr = matcher.group(1);
            LocalDate valueDate = LocalDate.parse(valueDateStr, VALUE_DATE_FMT);

            String bookingDateStr = matcher.group(2);
            LocalDate bookingDate = valueDate;
            if (StringUtils.isNotBlank(bookingDateStr)) {
                int month = Integer.parseInt(bookingDateStr.substring(0, 2));
                int day = Integer.parseInt(bookingDateStr.substring(2, 4));
                bookingDate = LocalDate.of(valueDate.getYear(), month, day);
            }

            char debitCredit = matcher.group(3).charAt(0);
            BigDecimal amount = new BigDecimal(matcher.group(4).replace(',', '.'));
            if (debitCredit == 'D') {
                amount = amount.negate();
            }

            String narrative = matcher.group(6).trim();

            Mt940TransactionRecord record = new Mt940TransactionRecord();
            record.setOwnAccount(ownAccount);
            record.setValueDate(valueDate);
            record.setBookingDate(bookingDate);
            record.setDebitCredit(debitCredit);
            record.setAmount(amount);
            record.setNarrative(narrative);
            record.setCurrency("EUR"); // adjust if your statements include currency meta
            return record;
        }

        private static void enrichCounterparty(Mt940TransactionRecord record) {
            String remittance = record.getRemittance();
            if (StringUtils.isBlank(remittance)) {
                record.setRemittance(record.getNarrative());
                return;
            }
            record.setRemittance(remittance);

            Matcher iban = IBAN_TAG.matcher(remittance);
            if (iban.find()) {
                record.setCounterpartyAccount(iban.group(1).trim());
            }

            Matcher name = NAME_TAG.matcher(remittance);
            if (name.find()) {
                record.setCounterpartyName(name.group(1).trim());
            } else if (StringUtils.isBlank(record.getCounterpartyName())) {
                record.setCounterpartyName(guessNameFromRemittance(remittance));
            }

            Matcher bic = BIC_TAG.matcher(remittance);
            if (bic.find() && StringUtils.isBlank(record.getNarrative())) {
                record.setNarrative(bic.group(1).trim());
            }
        }

        private static String guessNameFromRemittance(String remittance) {
            String[] lines = remittance.split("\n");
            for (String line : lines) {
                line = line.trim();
                if (line.length() > 4 && Character.isLetter(line.charAt(0))) {
                    return line;
                }
            }
            return null;
        }
    }

    @Data
    private static class Mt940TransactionRecord {
        private LocalDate bookingDate;
        private LocalDate valueDate;
        private char debitCredit;
        private BigDecimal amount;
        private String ownAccount;
        private String counterpartyAccount;
        private String counterpartyName;
        private String narrative;
        private String remittance;
        private String currency;
    }

}
