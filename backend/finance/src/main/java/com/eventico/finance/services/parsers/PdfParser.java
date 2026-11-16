package com.eventico.finance.services.parsers;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class PdfParser {

    private static final Pattern INVOICE_NUMBER =
            Pattern.compile("(invoice|factuur)\\s*[:#\\-]?\\s*([A-Za-z0-9\\-/]+)", Pattern.CASE_INSENSITIVE);
    private static final Pattern DATE_PATTERN =
            Pattern.compile("(\\d{2}[./-]\\d{2}[./-]\\d{4})");
    private static final Pattern TOTAL_PATTERN =
            Pattern.compile("(total|totaal|amount due)\\s*[:#\\-]?\\s*€?\\s*([0-9.,]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern TABLE_HEADER =
            Pattern.compile("omschrijving.*(prijs|tarief).*?(uren|aantal).*?bedrag", Pattern.CASE_INSENSITIVE);
    private static final Pattern LINE_PATTERN = Pattern.compile(
            "^(.+?)\\s+€?\\s*([0-9]+(?:[.,][0-9]{1,2})?)\\s+([0-9]+(?:[.,][0-9]{1,2})?)\\s+€?\\s*([0-9]+(?:[.,][0-9]{2})?)$"
    );

    public ParsedInvoice parse(Path pdfPath) {
        try (PDDocument doc = Loader.loadPDF(pdfPath.toFile())) {
            String text = new PDFTextStripper().getText(doc);
            return parseFromText(text);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to parse PDF", e);
        }
    }

    public ParsedInvoice parseFromText(String text) {
        String normalized = text.toLowerCase(Locale.ROOT);
        ParsedInvoice.ParsedInvoiceBuilder builder = ParsedInvoice.builder()
                .pdfTextContent(text)
                .currency("EUR")
                .extractionMethod("pdf_parser");

        Matcher numberMatcher = INVOICE_NUMBER.matcher(text);
        if (numberMatcher.find()) {
            builder.invoiceNumber(StringUtils.trim(numberMatcher.group(2)));
        }

        Matcher dateMatcher = DATE_PATTERN.matcher(text);
        if (dateMatcher.find()) {
            builder.invoiceDate(parseDate(dateMatcher.group(1)));
        }

        Matcher totalMatcher = TOTAL_PATTERN.matcher(text);
        if (totalMatcher.find()) {
            builder.amountInclVat(parseAmount(totalMatcher.group(2)));
        }

        builder.supplierName(extractSupplier(normalized));
        builder.supplierAddress(extractAddress(normalized));
        builder.extractionConfidence(0.65);

        extractLines(text).forEach(builder::line);

        return builder.build();
    }

    private List<ParsedInvoiceLine> extractLines(String text) {
        List<ParsedInvoiceLine> lines = new ArrayList<>();
        boolean inTable = false;

        for (String raw : text.split("\\R")) {
            String line = raw.replace('\u00A0', ' ').trim();
            if (line.isEmpty()) continue;

            if (!inTable) {
                inTable = TABLE_HEADER.matcher(line.toLowerCase(Locale.ROOT)).find();
                continue;
            }

            Matcher matcher = LINE_PATTERN.matcher(line);
            if (!matcher.matches()) {
                if (!lines.isEmpty()) {
                    ParsedInvoiceLine last = lines.remove(lines.size() - 1);
                    lines.add(last.toBuilder()
                            .description((last.getDescription() + " " + line).trim())
                            .build());
                }
                continue;
            }

            lines.add(ParsedInvoiceLine.builder()
                    .description(matcher.group(1).trim())
                    .unitPrice(parseAmount(matcher.group(2)))
                    .quantity(parseAmount(matcher.group(3)))
                    .amountInclVat(parseAmount(matcher.group(4)))
                    .build());
        }

        return lines;
    }

    private LocalDate parseDate(String raw) {
        String normalized = raw.replace('.', '-').replace('/', '-');
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        return LocalDate.parse(normalized, formatter);
    }

    private BigDecimal parseAmount(String raw) {
        return new BigDecimal(raw.replace(".", "").replace(",", "."));
    }

    private String extractSupplier(String text) {
        int idx = text.indexOf("kvk");
        if (idx > 0) {
            int start = Math.max(0, idx - 80);
            return text.substring(start, idx).lines().findFirst().orElse("Onbekend").trim();
        }
        return "Onbekend";
    }

    private String extractAddress(String text) {
        if (text.contains("street") || text.contains("straat")) {
            int idx = text.indexOf("straat");
            int start = Math.max(idx - 30, 0);
            return text.substring(start, Math.min(text.length(), idx + 30)).trim();
        }
        return null;
    }
}
