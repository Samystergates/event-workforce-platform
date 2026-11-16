package com.eventico.finance.services.implementations;

import com.eventico.finance.repositories.BankTransactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class CamtImportServiceImpTest {
    private final CamtImportServiceImp service =
            new CamtImportServiceImp(mock(BankTransactionRepository.class));

    @Test
    void rejectsDtdAndExternalEntityDeclarations() {
        String xml = "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY x SYSTEM \"file:///etc/passwd\">]>"
                + "<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:camt.053.001.02\">&x;</Document>";
        MockMultipartFile file = new MockMultipartFile("file", "statement.xml", "application/xml", xml.getBytes());

        assertThrows(IllegalStateException.class, () -> service.importFile(file));
    }
}
