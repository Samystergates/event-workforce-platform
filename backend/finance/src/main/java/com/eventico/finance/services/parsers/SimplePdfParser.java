package com.eventico.finance.services.parsers;


import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Path;

@Component
public class SimplePdfParser {

    public ParsedInvoice parse(Path pdfPath) {
        try (PDDocument doc = Loader.loadPDF(pdfPath.toFile())) {
            String text = new PDFTextStripper().getText(doc);
            return ParsedInvoice.builder()
                    .pdfTextContent(text)
                    .extractionMethod("pdf_text")
                    .extractionConfidence(0.3)
                    .build();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to extract PDF text", e);
        }
    }
}