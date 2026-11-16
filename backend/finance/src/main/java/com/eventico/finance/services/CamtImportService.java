package com.eventico.finance.services;

import com.eventico.finance.dtos.BankImportResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CamtImportService {
    BankImportResponse importFile(MultipartFile file);
}
