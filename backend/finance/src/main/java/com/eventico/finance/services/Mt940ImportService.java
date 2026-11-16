package com.eventico.finance.services;

import com.eventico.finance.dtos.BankImportResponse;
import org.springframework.web.multipart.MultipartFile;

public interface Mt940ImportService {
    BankImportResponse importFile(MultipartFile file);
}