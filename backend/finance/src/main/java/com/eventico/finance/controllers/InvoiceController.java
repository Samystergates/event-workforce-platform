package com.eventico.finance.controllers;

import com.eventico.finance.dtos.EmailFetchRequest;
import com.eventico.finance.dtos.EmailFetchResponse;
import com.eventico.finance.dtos.InvoiceDetailDto;
import com.eventico.finance.dtos.InvoiceSummaryDto;
import com.eventico.finance.dtos.InvoiceUpdateRequest;
import com.eventico.finance.dtos.InvoiceUploadResponse;
import com.eventico.finance.services.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@Validated
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceSummaryDto>> list(
            @RequestParam(required = false) Boolean isValid,
            @RequestParam(required = false) Boolean isMatched,
            @RequestParam(required = false) String supplierName) {
        return ResponseEntity.ok(invoiceService.listInvoices(isValid, isMatched, supplierName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDetailDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoice(id));
    }

    @PostMapping("/upload")
    public ResponseEntity<InvoiceUploadResponse> upload(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(invoiceService.uploadInvoice(file, "manual-upload"));
    }

    @PostMapping("/fetch-from-email")
    public ResponseEntity<EmailFetchResponse> fetchFromEmail(@RequestBody @Validated EmailFetchRequest request) {
        return ResponseEntity.ok(invoiceService.fetchInvoices(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDetailDto> update(@PathVariable Long id,
                                                   @RequestBody InvoiceUpdateRequest request) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
