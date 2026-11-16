package com.eventico.finance.services.implementations;

import com.eventico.finance.configurations.AppProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InvoiceServiceImpTest {

    @TempDir
    Path tempDirectory;

    @Test
    void storesUploadUnderGeneratedNameInsideManualDirectory() throws Exception {
        AppProperties properties = new AppProperties();
        properties.setInvoiceStorageDirectory(tempDirectory.toString());
        InvoiceServiceImp service = new InvoiceServiceImp(null, null, null, null, properties, null);
        byte[] content = "demo invoice".getBytes(java.nio.charset.StandardCharsets.UTF_8);

        Path stored = Path.of(service.storeFile("../../outside/invoice.pdf", content)).toAbsolutePath().normalize();

        assertTrue(stored.startsWith(tempDirectory.resolve("manual").toAbsolutePath().normalize()));
        assertTrue(stored.getFileName().toString().endsWith(".pdf"));
        assertFalse(stored.getFileName().toString().contains(".."));
        assertArrayEquals(content, Files.readAllBytes(stored));
    }
}
