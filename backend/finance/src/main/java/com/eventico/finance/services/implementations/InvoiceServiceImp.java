package com.eventico.finance.services.implementations;

import com.eventico.finance.configurations.AppProperties;
import com.eventico.finance.dtos.EmailFetchRequest;
import com.eventico.finance.dtos.EmailFetchResponse;
import com.eventico.finance.dtos.FinanceDtoMapper;
import com.eventico.finance.dtos.InvoiceDetailDto;
import com.eventico.finance.dtos.InvoiceSummaryDto;
import com.eventico.finance.dtos.InvoiceUpdateRequest;
import com.eventico.finance.dtos.InvoiceUploadResponse;
import com.eventico.finance.entities.Invoice;
import com.eventico.finance.repositories.InvoiceRepository;
import com.eventico.finance.services.InvoiceService;
import com.eventico.finance.services.mails.MailAttachment;
import com.eventico.finance.services.mails.MicrosoftGraphEmailService;
import com.eventico.finance.services.mappers.InvoiceMapper;
import com.eventico.finance.services.parsers.InvoiceParsingFacade;
import com.eventico.finance.services.parsers.ParsedInvoice;
import com.eventico.finance.services.validations.InvoiceValidatorService;
import com.eventico.finance.services.validations.ValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceServiceImp implements InvoiceService {

    private final InvoiceParsingFacade parsingFacade;
    private final InvoiceValidatorService validatorService;
    private final InvoiceMapper mapper;
    private final InvoiceRepository invoiceRepository;
    private final AppProperties properties;
    private final ObjectProvider<MicrosoftGraphEmailService> emailServiceProvider;

    @Override
    @Transactional
    public InvoiceUploadResponse uploadInvoice(MultipartFile file, String source) {
        try {
            byte[] bytes = file.getBytes();
            Path temp = Files.createTempFile("upload-", "." + FilenameUtils.getExtension(file.getOriginalFilename()));
            Files.write(temp, bytes);

            ParsedInvoice parsed = parsingFacade.parse(temp);
            ValidationResult validation = validatorService.validate(parsed);

            Invoice invoice = mapper.toEntity(parsed, storeFile(file.getOriginalFilename(), bytes), bytes, file.getOriginalFilename());
            invoice.setEmailSender(source);
            invoice.setIsValid(validation.isValid());
            invoice.setValidationErrors(String.join(" | ", validation.getErrors()));
            invoiceRepository.save(invoice);

            Files.deleteIfExists(temp);

            return new InvoiceUploadResponse(
                    invoice.getId(),
                    validation.isValid(),
                    validation.getErrors(),
                    validation.getWarnings(),
                    parsed.getExtractionConfidence());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to store invoice", e);
        }
    }

    @Override
    @Transactional
    public EmailFetchResponse fetchInvoices(EmailFetchRequest request) {
        MicrosoftGraphEmailService emailService = emailServiceProvider.getIfAvailable();
        if (emailService == null) {
            throw new IllegalStateException("Microsoft Graph integration is disabled");
        }

        int lookback = request.daysBack() == null ? 30 : request.daysBack();
        List<MailAttachment> attachments = emailService.fetchInvoiceAttachments(
                request.emailAddress(),
                lookback,
                request.folderPath());

        List<String> failures = new ArrayList<>();
        int processed = 0;

        for (MailAttachment attachment : attachments) {
            try {
                ParsedInvoice parsed = parsingFacade.parse(attachment.getStoredPath());
                ValidationResult validation = validatorService.validate(parsed);

                if (parsed.getInvoiceDate() == null) {
                    log.warn("Parsed invoice '{}' has no invoice date. Number='{}', amount='{}', warnings={}",
                            attachment.getOriginalFilename(),
                            parsed.getInvoiceNumber(),
                            parsed.getAmountInclVat(),
                            parsed.getWarnings());
                } else {
                    log.debug("Parsed invoice '{}' with invoice date {}", attachment.getOriginalFilename(),
                            parsed.getInvoiceDate());
                }

                Invoice invoice = mapper.toEntity(
                        parsed,
                        attachment.getStoredPath().toString(),
                        Files.readAllBytes(attachment.getStoredPath()),
                        attachment.getOriginalFilename());

                invoice.setEmailMessageId(attachment.getMessageId());
                invoice.setEmailSender(attachment.getFrom());
                invoice.setEmailFolder(attachment.getFolder());
                invoice.setIsValid(validation.isValid());
                invoice.setValidationErrors(String.join(" | ", validation.getErrors()));
                invoiceRepository.save(invoice);

                processed++;
            } catch (Exception e) {
                log.warn("Failed to process attachment {}: {}", attachment.getOriginalFilename(), e.getMessage());
                failures.add(attachment.getOriginalFilename());
            }
        }

        return new EmailFetchResponse(attachments.size(), processed, failures);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceSummaryDto> listInvoices(Boolean isValid, Boolean isMatched, String supplierName) {
        return invoiceRepository.findAll().stream()
                .filter(invoice -> isValid == null || isValid.equals(invoice.getIsValid()))
                .filter(invoice -> isMatched == null || isMatched.equals(invoice.getIsMatched()))
                .filter(invoice -> supplierName == null || (invoice.getSupplierName() != null
                        && invoice.getSupplierName().toLowerCase().contains(supplierName.toLowerCase())))
                .map(FinanceDtoMapper::toInvoiceSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDetailDto getInvoice(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));
        return FinanceDtoMapper.toInvoiceDetailDto(invoice);
    }

    @Override
    @Transactional
    public InvoiceDetailDto updateInvoice(Long id, InvoiceUpdateRequest request) {
        Invoice invoice = invoiceRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));

        if (request.isValid() != null) invoice.setIsValid(request.isValid());
        if (request.isMatched() != null) invoice.setIsMatched(request.isMatched());
        if (request.isPaid() != null) invoice.setIsPaid(request.isPaid());

        if (request.supplierName() != null) invoice.setSupplierName(request.supplierName());
        if (request.supplierAddress() != null) invoice.setSupplierAddress(request.supplierAddress());
        if (request.supplierPostalCode() != null) invoice.setSupplierPostalCode(request.supplierPostalCode());
        if (request.supplierCity() != null) invoice.setSupplierCity(request.supplierCity());
        if (request.supplierCountry() != null) invoice.setSupplierCountry(request.supplierCountry());
        if (request.supplierVatNumber() != null) invoice.setSupplierVatNumber(request.supplierVatNumber());
        if (request.supplierKvkNumber() != null) invoice.setSupplierKvkNumber(request.supplierKvkNumber());

        if (request.customerName() != null) invoice.setCustomerName(request.customerName());
        if (request.customerAddress() != null) invoice.setCustomerAddress(request.customerAddress());
        if (request.customerPostalCode() != null) invoice.setCustomerPostalCode(request.customerPostalCode());
        if (request.customerCity() != null) invoice.setCustomerCity(request.customerCity());
        if (request.customerCountry() != null) invoice.setCustomerCountry(request.customerCountry());
        if (request.customerVatNumber() != null) invoice.setCustomerVatNumber(request.customerVatNumber());

//        if (request.invoiceNumber() != null) invoice.setInvoiceNumber(request.invoiceNumber());
//        if (request.invoiceDate() != null) invoice.setInvoiceDate(request.invoiceDate());
        if (request.dueDate() != null) invoice.setDueDate(request.dueDate());
        if (request.amountInclVat() != null) invoice.setAmountInclVat(request.amountInclVat());
        if (request.amountExclVat() != null) invoice.setAmountExclVat(request.amountExclVat());
        if (request.vatAmount() != null) invoice.setVatAmount(request.vatAmount());

        return FinanceDtoMapper.toInvoiceDetailDto(invoice);
    }

    @Override
    @Transactional
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    String storeFile(String originalFilename, byte[] bytes) throws Exception {
        Path manualDirectory = properties.storagePath().toAbsolutePath().normalize().resolve("manual").normalize();
        String extension = FilenameUtils.getExtension(originalFilename);
        String safeExtension = extension != null && extension.matches("[A-Za-z0-9]{1,10}")
                ? "." + extension
                : "";
        Path destination = manualDirectory.resolve(UUID.randomUUID() + safeExtension).normalize();
        if (!destination.startsWith(manualDirectory)) {
            throw new IllegalArgumentException("Invoice upload path is outside the configured storage directory");
        }
        Files.createDirectories(manualDirectory);
        Files.write(destination, bytes, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
        return destination.toString();
    }
}
