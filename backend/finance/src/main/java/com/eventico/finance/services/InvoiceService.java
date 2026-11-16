package com.eventico.finance.services;

import com.eventico.finance.dtos.EmailFetchRequest;
import com.eventico.finance.dtos.EmailFetchResponse;
import com.eventico.finance.dtos.InvoiceDetailDto;
import com.eventico.finance.dtos.InvoiceSummaryDto;
import com.eventico.finance.dtos.InvoiceUpdateRequest;
import com.eventico.finance.dtos.InvoiceUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface InvoiceService {
    InvoiceUploadResponse uploadInvoice(MultipartFile file, String source);

    EmailFetchResponse fetchInvoices(EmailFetchRequest request);

    List<InvoiceSummaryDto> listInvoices(Boolean isValid, Boolean isMatched, String supplierName);

    InvoiceDetailDto getInvoice(Long id);

    InvoiceDetailDto updateInvoice(Long id, InvoiceUpdateRequest request);

    void deleteInvoice(Long id);
}
