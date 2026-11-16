//package com.eventico.finance.services.parsers;
//
//import com.eventico.finance.configurations.AppProperties;
//import com.eventico.finance.services.docai.DocumentAiService;
//import com.eventico.finance.services.ocr.OcrService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.apache.commons.lang3.StringUtils;
//import org.springframework.stereotype.Service;
//
//import java.nio.file.Path;
//import java.util.HashSet;
//import java.util.Set;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class InvoiceParsingFacade {
//
//    private final DocumentClassifier classifier;
//    private final ImprovedPdfParser improvedPdfParser;
//    private final SimplePdfParser simplePdfParser;
//    private final OcrService ocrService;
//    private final DocumentAiService documentAiService;
//    private final AppProperties properties;
//
//    public ParsedInvoice parse(Path pdfPath) {
//        if (!classifier.isInvoice(pdfPath)) {
//            log.debug("Classifier marked '{}' as non-invoice; skipping parsing", pdfPath.getFileName());
//            return ParsedInvoice.builder()
//                    .extractionMethod("not_invoice")
//                    .warnings(Set.of("Document classified as non-invoice"))
//                    .pdfTextContent("")
//                    .build();
//        }
//
//        ParsedInvoice parsed = improvedPdfParser.parse(pdfPath);
//        int initialLength = StringUtils.length(parsed.getPdfTextContent());
//        log.debug("Initial parser extracted {} characters from '{}'", initialLength, pdfPath.getFileName());
//
//        ParsedInvoice fallbackParsed = simplePdfParser.parse(pdfPath);
//        parsed = mergeFallback(parsed, fallbackParsed);
//        int afterFallbackLength = StringUtils.length(parsed.getPdfTextContent());
//        if (afterFallbackLength != initialLength) {
//            log.debug("Fallback parser replaced text; new length {} for '{}'", afterFallbackLength, pdfPath.getFileName());
//        } else {
//            log.debug("Fallback parser did not change text for '{}'", pdfPath.getFileName());
//        }
//
//        boolean runOcr = needsOcr(parsed);
//        log.debug("Text length {} vs threshold {} for '{}'; OCR {}", afterFallbackLength,
//                properties.getOcrTextThreshold(), pdfPath.getFileName(),
//                runOcr ? "will run" : "not needed");
//        if (runOcr) {
////            parsed = runOcr(pdfPath, parsed);
//
//                parsed = runOcr(pdfPath, parsed);
//
//                ParsedInvoice parsedFromOcr = improvedPdfParser.parseFromText(parsed.getPdfTextContent());
//                parsed = mergeStructured(parsed, parsedFromOcr);
//
//            log.debug("After OCR, extracted {} characters from '{}'",
//                    StringUtils.length(parsed.getPdfTextContent()), pdfPath.getFileName());
//        }
//
//        boolean runDocAi = shouldUseDocumentAi(parsed);
//        log.debug("Document AI {} for '{}'", runDocAi ? "will run" : "skipped", pdfPath.getFileName());
//        if (runDocAi) {
//            parsed = documentAiService.enhance(pdfPath, parsed);
//        }
//
//        Set<String> warnings = new HashSet<>(parsed.getWarnings() == null ? Set.of() : parsed.getWarnings());
//        if (parsed.getInvoiceNumber() == null) {
//            warnings.add("Factuurnummer niet gevonden");
//        }
//        return parsed.toBuilder().warnings(warnings).build();
//    }
//
//    private ParsedInvoice mergeFallback(ParsedInvoice primary, ParsedInvoice fallback) {
//        if (StringUtils.isBlank(primary.getPdfTextContent()) && StringUtils.isNotBlank(fallback.getPdfTextContent())) {
//            primary = primary.toBuilder().pdfTextContent(fallback.getPdfTextContent()).build();
//        }
//        return primary;
//    }
//
//    private ParsedInvoice mergeStructured(ParsedInvoice base, ParsedInvoice candidate) {
//        if (candidate == null) {
//            return base;
//        }
//
//        ParsedInvoice.ParsedInvoiceBuilder builder = base.toBuilder();
//
//        if (base.getInvoiceNumber() == null && candidate.getInvoiceNumber() != null) {
//            builder.invoiceNumber(candidate.getInvoiceNumber());
//        }
//        if (base.getInvoiceDate() == null && candidate.getInvoiceDate() != null) {
//            builder.invoiceDate(candidate.getInvoiceDate());
//        }
//        if (base.getDueDate() == null && candidate.getDueDate() != null) {
//            builder.dueDate(candidate.getDueDate());
//        }
//        if (StringUtils.isBlank(base.getSupplierName()) && StringUtils.isNotBlank(candidate.getSupplierName())) {
//            builder.supplierName(candidate.getSupplierName());
//        }
//        if (StringUtils.isBlank(base.getSupplierAddress()) && StringUtils.isNotBlank(candidate.getSupplierAddress())) {
//            builder.supplierAddress(candidate.getSupplierAddress());
//        }
//        if (StringUtils.isBlank(base.getSupplierPostalCode()) && StringUtils.isNotBlank(candidate.getSupplierPostalCode())) {
//            builder.supplierPostalCode(candidate.getSupplierPostalCode());
//        }
//        if (StringUtils.isBlank(base.getSupplierCity()) && StringUtils.isNotBlank(candidate.getSupplierCity())) {
//            builder.supplierCity(candidate.getSupplierCity());
//        }
//        if (base.getAmountExclVat() == null && candidate.getAmountExclVat() != null) {
//            builder.amountExclVat(candidate.getAmountExclVat());
//        }
//        if (base.getVatAmount() == null && candidate.getVatAmount() != null) {
//            builder.vatAmount(candidate.getVatAmount());
//        }
//        if (base.getAmountInclVat() == null && candidate.getAmountInclVat() != null) {
//            builder.amountInclVat(candidate.getAmountInclVat());
//        }
//
//        Set<String> mergedWarnings = new HashSet<>();
//        if (base.getWarnings() != null) {
//            mergedWarnings.addAll(base.getWarnings());
//        }
//        if (candidate.getWarnings() != null) {
//            mergedWarnings.addAll(candidate.getWarnings());
//        }
//        builder.clearWarnings();
//        mergedWarnings.forEach(builder::warning);
//
//        return builder.build();
//    }
//
//
//    private boolean needsOcr(ParsedInvoice parsed) {
//        return StringUtils.length(parsed.getPdfTextContent()) < properties.getOcrTextThreshold();
//    }
//
//    private ParsedInvoice runOcr(Path pdfPath, ParsedInvoice current) {
//        try {
//            return ocrService.applyOcr(pdfPath, current);
//        } catch (Exception e) {
//            log.warn("OCR failed for '{}': {}", pdfPath.getFileName(), e.getMessage());
//            Set<String> warnings = new HashSet<>(current.getWarnings() == null ? Set.of() : current.getWarnings());
//            warnings.add("OCR fallback failed: " + e.getMessage());
//            return current.toBuilder().warnings(warnings).build();
//        }
//    }
//
//    private boolean shouldUseDocumentAi(ParsedInvoice parsed) {
//        if (parsed.getExtractionConfidence() == null
//                || parsed.getExtractionConfidence() < properties.getDocumentAiFallbackThreshold()) {
//            return true;
//        }
//        return parsed.getInvoiceNumber() == null
//                || parsed.getAmountInclVat() == null
//                || parsed.getSupplierName() == null;
//    }
//
//}

package com.eventico.finance.services.parsers;

import com.eventico.finance.configurations.AppProperties;
import com.eventico.finance.services.docai.DocumentAiService;
import com.eventico.finance.services.ocr.OcrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceParsingFacade {

    private final DocumentClassifier classifier;
    private final ImprovedPdfParser improvedPdfParser;
    private final SimplePdfParser simplePdfParser;
    private final OcrService ocrService;
    private final DocumentAiService documentAiService;
    private final AppProperties properties;

    public ParsedInvoice parse(Path pdfPath) {
        if (!classifier.isInvoice(pdfPath)) {
            log.debug("Classifier marked '{}' as non-invoice; skipping parsing", pdfPath.getFileName());
            return ParsedInvoice.builder()
                    .extractionMethod("not_invoice")
                    .warnings(Set.of("Document classified as non-invoice"))
                    .pdfTextContent("")
                    .build();
        }

        ParsedInvoice parsed = improvedPdfParser.parse(pdfPath);
        parsed = mergeFallback(parsed, simplePdfParser.parse(pdfPath));

        if (needsOcr(parsed)) {
            parsed = runOcr(pdfPath, parsed);
            ParsedInvoice ocrParsed = improvedPdfParser.parseFromText(parsed.getPdfTextContent());
            parsed = mergeStructured(parsed, ocrParsed);
        }

        if (shouldUseDocumentAi(parsed)) {
            parsed = documentAiService.enhance(pdfPath, parsed);
        }

        Set<String> warnings = new HashSet<>(parsed.getWarnings() == null ? Set.of() : parsed.getWarnings());
        if (parsed.getInvoiceNumber() == null) {
            warnings.add("Factuurnummer niet gevonden");
        }
        return parsed.toBuilder().warnings(warnings).build();
    }

    private ParsedInvoice mergeFallback(ParsedInvoice primary, ParsedInvoice fallback) {
        if (StringUtils.isBlank(primary.getPdfTextContent()) && StringUtils.isNotBlank(fallback.getPdfTextContent())) {
            primary = primary.toBuilder().pdfTextContent(fallback.getPdfTextContent()).build();
        }
        return primary;
    }

    private ParsedInvoice mergeStructured(ParsedInvoice base, ParsedInvoice candidate) {
        if (candidate == null) {
            return base;
        }

        ParsedInvoice.ParsedInvoiceBuilder builder = base.toBuilder();

        if (base.getInvoiceNumber() == null && candidate.getInvoiceNumber() != null) {
            builder.invoiceNumber(candidate.getInvoiceNumber());
        }
        if (base.getInvoiceDate() == null && candidate.getInvoiceDate() != null) {
            builder.invoiceDate(candidate.getInvoiceDate());
        }
        if (base.getDueDate() == null && candidate.getDueDate() != null) {
            builder.dueDate(candidate.getDueDate());
        }
        if (isMissing(base.getSupplierName()) && StringUtils.isNotBlank(candidate.getSupplierName())) {
            builder.supplierName(candidate.getSupplierName());
        }
        if (isMissing(base.getSupplierAddress()) && StringUtils.isNotBlank(candidate.getSupplierAddress())) {
            builder.supplierAddress(candidate.getSupplierAddress());
        }
        if (isMissing(base.getSupplierPostalCode()) && StringUtils.isNotBlank(candidate.getSupplierPostalCode())) {
            builder.supplierPostalCode(candidate.getSupplierPostalCode());
        }
        if (isMissing(base.getSupplierCity()) && StringUtils.isNotBlank(candidate.getSupplierCity())) {
            builder.supplierCity(candidate.getSupplierCity());
        }
        if (isMissing(base.getSupplierVatNumber()) && StringUtils.isNotBlank(candidate.getSupplierVatNumber())) {
            builder.supplierVatNumber(candidate.getSupplierVatNumber());
        }
        if (isMissing(base.getSupplierIban()) && StringUtils.isNotBlank(candidate.getSupplierIban())) {
            builder.supplierIban(candidate.getSupplierIban());
        }
        if (base.getAmountExclVat() == null && candidate.getAmountExclVat() != null) {
            builder.amountExclVat(candidate.getAmountExclVat());
        }
        if (base.getVatAmount() == null && candidate.getVatAmount() != null) {
            builder.vatAmount(candidate.getVatAmount());
        }
        if (base.getAmountInclVat() == null && candidate.getAmountInclVat() != null) {
            builder.amountInclVat(candidate.getAmountInclVat());
        }
        if ((base.getLines() == null || base.getLines().isEmpty()) && candidate.getLines() != null) {
            candidate.getLines().forEach(builder::line);
        }

        Set<String> mergedWarnings = new HashSet<>();
        if (base.getWarnings() != null) {
            mergedWarnings.addAll(base.getWarnings());
        }
        if (candidate.getWarnings() != null) {
            mergedWarnings.addAll(candidate.getWarnings());
        }
        builder.clearWarnings();
        mergedWarnings.forEach(builder::warning);

        return builder.build();
    }

    private boolean isMissing(String value) {
        return StringUtils.isBlank(value) || "onbekend".equalsIgnoreCase(value.trim());
    }


//    private ParsedInvoice mergeStructured(ParsedInvoice base, ParsedInvoice candidate) {
//        if (candidate == null) {
//            return base;
//        }
//
//        ParsedInvoice.ParsedInvoiceBuilder builder = base.toBuilder();
//
//        if (base.getInvoiceNumber() == null && candidate.getInvoiceNumber() != null) {
//            builder.invoiceNumber(candidate.getInvoiceNumber());
//        }
//        if (base.getInvoiceDate() == null && candidate.getInvoiceDate() != null) {
//            builder.invoiceDate(candidate.getInvoiceDate());
//        }
//        if (base.getDueDate() == null && candidate.getDueDate() != null) {
//            builder.dueDate(candidate.getDueDate());
//        }
//        if (StringUtils.isBlank(base.getSupplierName()) && StringUtils.isNotBlank(candidate.getSupplierName())) {
//            builder.supplierName(candidate.getSupplierName());
//        }
//        if (StringUtils.isBlank(base.getSupplierAddress()) && StringUtils.isNotBlank(candidate.getSupplierAddress())) {
//            builder.supplierAddress(candidate.getSupplierAddress());
//        }
//        if (StringUtils.isBlank(base.getSupplierPostalCode()) && StringUtils.isNotBlank(candidate.getSupplierPostalCode())) {
//            builder.supplierPostalCode(candidate.getSupplierPostalCode());
//        }
//        if (StringUtils.isBlank(base.getSupplierCity()) && StringUtils.isNotBlank(candidate.getSupplierCity())) {
//            builder.supplierCity(candidate.getSupplierCity());
//        }
//        if (base.getAmountExclVat() == null && candidate.getAmountExclVat() != null) {
//            builder.amountExclVat(candidate.getAmountExclVat());
//        }
//        if (base.getVatAmount() == null && candidate.getVatAmount() != null) {
//            builder.vatAmount(candidate.getVatAmount());
//        }
//        if (base.getAmountInclVat() == null && candidate.getAmountInclVat() != null) {
//            builder.amountInclVat(candidate.getAmountInclVat());
//        }
//        if ((base.getLines() == null || base.getLines().isEmpty()) && candidate.getLines() != null) {
//            candidate.getLines().forEach(builder::line);
//        }
//
//        Set<String> mergedWarnings = new HashSet<>();
//        if (base.getWarnings() != null) {
//            mergedWarnings.addAll(base.getWarnings());
//        }
//        if (candidate.getWarnings() != null) {
//            mergedWarnings.addAll(candidate.getWarnings());
//        }
//        builder.clearWarnings();
//        mergedWarnings.forEach(builder::warning);
//
//        return builder.build();
//    }

    private boolean needsOcr(ParsedInvoice parsed) {
        return StringUtils.length(parsed.getPdfTextContent()) < properties.getOcrTextThreshold();
    }

    private ParsedInvoice runOcr(Path pdfPath, ParsedInvoice current) {
        try {
            return ocrService.applyOcr(pdfPath, current);
        } catch (Exception e) {
            log.warn("OCR failed for '{}': {}", pdfPath.getFileName(), e.getMessage());
            Set<String> warnings = new HashSet<>(current.getWarnings() == null ? Set.of() : current.getWarnings());
            warnings.add("OCR fallback failed: " + e.getMessage());
            return current.toBuilder().warnings(warnings).build();
        }
    }

    private boolean shouldUseDocumentAi(ParsedInvoice parsed) {
        if (parsed.getExtractionConfidence() == null
                || parsed.getExtractionConfidence() < properties.getDocumentAiFallbackThreshold()) {
            return true;
        }
        return parsed.getInvoiceNumber() == null
                || parsed.getAmountInclVat() == null
                || parsed.getSupplierName() == null;
    }
}
