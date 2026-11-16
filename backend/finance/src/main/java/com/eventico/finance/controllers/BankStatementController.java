package com.eventico.finance.controllers;

import com.eventico.finance.dtos.BankImportResponse;
import com.eventico.finance.dtos.BankTransactionDto;
import com.eventico.finance.services.BankTransactionService;
import com.eventico.finance.services.CamtImportService;
import com.eventico.finance.services.Mt940ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/bank")
@RequiredArgsConstructor
@Validated
public class BankStatementController {

    private final CamtImportService camtImportService;
    private final Mt940ImportService mt940ImportService;
    private final BankTransactionService bankTransactionService;

    @PostMapping("/upload-camt")
    public ResponseEntity<BankImportResponse> uploadCamt(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(camtImportService.importFile(file));
    }

    @PostMapping("/upload-mt940")
    public ResponseEntity<BankImportResponse> uploadMt940(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(mt940ImportService.importFile(file));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<BankTransactionDto>> listTransactions() {
        return ResponseEntity.ok(bankTransactionService.listTransactions());
    }
}
