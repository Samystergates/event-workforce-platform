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
import java.time.format.DateTimeFormatterBuilder;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ImprovedPdfParser {

    private static final Pattern ACCOUNT_NAME_PATTERN =
            Pattern.compile("op naam(?: van)?\\s*[:\\-]?\\s*(.+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern ACCOUNT_HOLDER_PATTERN =
            Pattern.compile("rekeninghouder\\s*[:\\-]?\\s*(.+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern INVOICE_NUMBER =
            Pattern.compile("(?:invoice|factuur(?:nr|nummer)?|factuurnr)\\s*[:#\\-\\.]?\\s*(#[A-Za-z0-9\\-/]+|[A-Za-z0-9\\-/]+)",
                    Pattern.CASE_INSENSITIVE);

    private static final Pattern DUE_DATE_PATTERN =
            Pattern.compile("vervaldatum\\s*[:]?\\s*(\\d{1,2}[./-]\\d{1,2}[./-]\\d{4})", Pattern.CASE_INSENSITIVE);

    private static final Pattern SUPPLIER_VAT_PATTERN =
            Pattern.compile("\\bBTW[-\\s]?id\\s*[:]?\\s*([A-Z0-9]{8,})", Pattern.CASE_INSENSITIVE);

    private static final Pattern SUPPLIER_VAT_SHORT_PATTERN =
            Pattern.compile("\\bBTW\\s*[:]?\\s*([A-Z0-9]{8,})", Pattern.CASE_INSENSITIVE);

    private static final Pattern SUPPLIER_KVK_PATTERN =
            Pattern.compile("\\bKVK\\s*[:]?\\s*([0-9]{6,})", Pattern.CASE_INSENSITIVE);

    private static final Pattern IBAN_PATTERN =
            Pattern.compile("\\bNL\\d{2}\\s*[A-Z]{4}\\s*[0-9A-Z]{4}\\s*[0-9A-Z]{4}\\s*[0-9A-Z]{2}\\b",
                    Pattern.CASE_INSENSITIVE);

    private static final Pattern TOTAL_PATTERN =
            Pattern.compile("(total|totaal)[^€]*€\\s*([0-9.,]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern TOTAL_INCL_PATTERN =
            Pattern.compile("totaal[^\\n]*incl[^€]*€\\s*([0-9.,]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern SUBTOTAL_PATTERN =
            Pattern.compile("(subtotaal|totaal\\s*excl)[^€]*€\\s*([0-9.,]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern VAT_TOTAL_PATTERN =
            Pattern.compile("btw[^€%]*([0-9]+(?:[.,][0-9]{1,2})?)%[^€]*€\\s*([0-9.,]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern VAT_PERCENT_PATTERN =
            Pattern.compile("([0-9]+(?:[.,][0-9]{1,2})?)%");

    private static final Pattern AMOUNT_WITH_CURRENCY =
            Pattern.compile("€\\s*([0-9.,]+)");

    private static final Pattern DATE_PATTERN_NUMERIC =
            Pattern.compile("\\b(\\d{1,2}[./-]\\d{1,2}[./-]\\d{4})\\b");

    private static final Pattern DATE_PATTERN_TEXTUAL =
            Pattern.compile("\\b(\\d{1,2}\\s+[\\p{L}]+\\s+\\d{4})\\b", Pattern.CASE_INSENSITIVE);

    private static final Pattern TABLE_HEADER =
            Pattern.compile("omschrijving.*(aantal)?.*(prijs|bedrag|tarief).*?(btw)", Pattern.CASE_INSENSITIVE);

    private static final Pattern LINE_FULL_PATTERN = Pattern.compile(
            "^(.+?)\\s+([0-9]+(?:[.,][0-9]{1,2})?)\\s+€\\s*([0-9]+(?:[.,][0-9]{1,2})?)\\s+([0-9]+(?:[.,][0-9]{1,2})?)%\\s+€\\s*([0-9]+(?:[.,][0-9]{1,2})?)$"
    );

    private static final Pattern LINE_NUMERIC_PATTERN = Pattern.compile(
            "^([0-9]+(?:[.,][0-9]{1,2})?)\\s+€\\s*([0-9]+(?:[.,][0-9]{1,2})?)\\s+([0-9]+(?:[.,][0-9]{1,2})?)%\\s+€\\s*([0-9]+(?:[.,][0-9]{1,2})?)$"
    );

    private static final Pattern POSTAL_PATTERN =
            Pattern.compile("\\b(\\d{4})\\s*([A-Z]{2})\\b");

    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            new DateTimeFormatterBuilder().parseCaseInsensitive().appendPattern("dd-MM-uuuu").toFormatter(),
            new DateTimeFormatterBuilder().parseCaseInsensitive().appendPattern("d-M-uuuu").toFormatter(),
            new DateTimeFormatterBuilder().parseCaseInsensitive().appendPattern("uuuu-MM-dd").toFormatter(),
            new DateTimeFormatterBuilder().parseCaseInsensitive()
                    .appendPattern("d MMMM uuuu")
                    .toFormatter(new Locale("nl", "NL")),
            new DateTimeFormatterBuilder().parseCaseInsensitive()
                    .appendPattern("d MMMM uuuu")
                    .toFormatter(Locale.ENGLISH)
    );

    private static final Set<String> COMPANY_SUFFIXES = Set.of(
            "B.V.", "BV", "N.V.", "NV", "LLC", "Inc", "GmbH", "Sarl", "Ltd", "Company", "Co.", "S.R.L", "S.L", "V.O.F");
    private static final Set<String> SUPPLIER_NEGATIVE = Set.of(
            "factuur", "factuuradres", "factuurnummer", "afleveradres", "klant", "customer",
            "ship to", "bill to", "je factuur", "je nummer", "contract", "bedankt", "summary", "eventico");
    private static final Set<String> CUSTOMER_INDICATORS = Set.of(
            "factuuradres", "afleveradres", "klant", "customer", "bill to", "ship to", "je nummer", "contract");
    private static final Set<String> SUPPLIER_ANCHORS = Set.of(
            "btw", "vat", "tax id", "kvk", "chamber", "iban", "bic", "rekening", "bank", "telefoon", "tel", "phone",
            "email", "mail", "www");
    private static final Pattern CAPITAL_PAIR = Pattern.compile("[A-Z][a-z]+\\s+[A-Z][a-z]+");
    private static final Pattern BRAND_UPPERCASE = Pattern.compile("^[A-Z0-9& .]{3,30}$");


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

        String invoiceNumber = extractInvoiceNumber(text);
        LocalDate invoiceDate = extractInvoiceDate(text);
        BigDecimal amountInclVat = extractAmountIncl(text);

        StructuredExtraction structured = extractStructuredData(text);

        if (invoiceNumber == null) {
            invoiceNumber = structured.invoiceNumber;
        }
        if (invoiceDate == null) {
            invoiceDate = structured.invoiceDate;
        }
        if (amountInclVat == null) {
            amountInclVat = structured.amountInclVat;
        }

        ParsedInvoice.ParsedInvoiceBuilder builder = ParsedInvoice.builder()
                .pdfTextContent(text)
                .currency("EUR")
                .extractionMethod("pdf_parser")
                .extractionConfidence(0.65);

        if (StringUtils.isNotBlank(invoiceNumber)) builder.invoiceNumber(invoiceNumber);
        if (invoiceDate != null) builder.invoiceDate(invoiceDate);
        if (structured.dueDate != null) builder.dueDate(structured.dueDate);

        if (StringUtils.isNotBlank(structured.customerName)) builder.customerName(structured.customerName);
        if (StringUtils.isNotBlank(structured.customerAddress)) builder.customerAddress(structured.customerAddress);
        if (StringUtils.isNotBlank(structured.customerPostalCode)) builder.customerPostalCode(structured.customerPostalCode);
        if (StringUtils.isNotBlank(structured.customerCity)) builder.customerCity(structured.customerCity);
        if (StringUtils.isNotBlank(structured.customerCountry)) builder.customerCountry(structured.customerCountry);

        if (StringUtils.isBlank(builder.build().getSupplierName())) {
            String supplierName = chooseSupplierName(structured);
            if (StringUtils.isNotBlank(supplierName)) builder.supplierName(supplierName);
        }

        if (StringUtils.isNotBlank(structured.supplierAddress)) builder.supplierAddress(structured.supplierAddress);
        if (StringUtils.isNotBlank(structured.supplierPostalCode)) builder.supplierPostalCode(structured.supplierPostalCode);
        if (StringUtils.isNotBlank(structured.supplierCity)) builder.supplierCity(structured.supplierCity);
        if (StringUtils.isNotBlank(structured.supplierCountry)) builder.supplierCountry(structured.supplierCountry);
        if (StringUtils.isNotBlank(structured.supplierVatNumber)) builder.supplierVatNumber(structured.supplierVatNumber);
        if (StringUtils.isNotBlank(structured.supplierKvkNumber)) builder.supplierKvkNumber(structured.supplierKvkNumber);
        if (StringUtils.isNotBlank(structured.supplierIban)) builder.supplierIban(structured.supplierIban);

        if (structured.amountExclVat != null) builder.amountExclVat(structured.amountExclVat);
        if (structured.vatAmount != null) builder.vatAmount(structured.vatAmount);
        if (amountInclVat != null) builder.amountInclVat(amountInclVat);
        if (structured.vatPercentage != null) builder.vatPercentage(structured.vatPercentage);

        structured.lines.forEach(builder::line);

        return builder.build();
    }

    private String chooseSupplierName(StructuredExtraction structured) {
        if (StringUtils.isNotBlank(structured.supplierBlockName)) return structured.supplierBlockName;
        if (StringUtils.isNotBlank(structured.supplierName)) return structured.supplierName;
        return null;
    }

    private String extractInvoiceNumber(String text) {
        Matcher matcher = INVOICE_NUMBER.matcher(text);
        return matcher.find() ? matcher.group(1).trim() : null;
    }

    private BigDecimal extractAmountIncl(String text) {
        Matcher inclMatcher = TOTAL_INCL_PATTERN.matcher(text);
        if (inclMatcher.find()) return parseAmount(inclMatcher.group(1));
        Matcher totalMatcher = TOTAL_PATTERN.matcher(text);
        return totalMatcher.find() ? parseAmount(totalMatcher.group(2)) : null;
    }

    private LocalDate extractInvoiceDate(String text) {
        Matcher numericMatcher = DATE_PATTERN_NUMERIC.matcher(text);
        if (numericMatcher.find()) {
            LocalDate parsed = parseDate(numericMatcher.group(1));
            if (parsed != null) return parsed;
        }
        Matcher textualMatcher = DATE_PATTERN_TEXTUAL.matcher(text);
        return textualMatcher.find() ? parseDate(textualMatcher.group(1)) : null;
    }

    private StructuredExtraction extractStructuredData(String text) {
        StructuredExtraction data = new StructuredExtraction();
        List<String> lines = text.lines()
                .map(line -> line.replace('\u00A0', ' ').trim())
                .filter(StringUtils::isNotBlank)
                .collect(Collectors.toList());

        evaluateBlocks(lines, data);

        if (StringUtils.isBlank(data.customerName)) {
            extractCustomerBlock(lines, data);
        }
        if (StringUtils.isBlank(data.supplierBlockName) && StringUtils.isBlank(data.supplierName)) {
            extractSupplierBlock(lines, data);
        }

        boolean inTable = false;
        boolean expectingSubtotal = false;
        boolean expectingVat = false;
        boolean expectingTotal = false;
        BigDecimal pendingVatPercentage = null;
        String pendingDescription = null;

        for (String raw : lines) {
            String line = raw.trim();
            String lower = line.toLowerCase(Locale.ROOT);

            if (data.invoiceNumber == null) {
                Matcher numberMatcher = INVOICE_NUMBER.matcher(line);
                if (numberMatcher.find()) data.invoiceNumber = numberMatcher.group(1).trim();
            }

            if (data.invoiceDate == null) {
                Matcher numericMatcher = DATE_PATTERN_NUMERIC.matcher(line);
                if (numericMatcher.find()) data.invoiceDate = parseDate(numericMatcher.group(1));
            }

            if (data.dueDate == null) {
                Matcher dueMatcher = DUE_DATE_PATTERN.matcher(line);
                if (dueMatcher.find()) data.dueDate = parseDate(dueMatcher.group(1));
            }

            if (data.supplierVatNumber == null) {
                Matcher vatIdMatcher = SUPPLIER_VAT_PATTERN.matcher(line);
                if (vatIdMatcher.find()) {
                    data.supplierVatNumber = vatIdMatcher.group(1).replaceAll("\\s+", "");
                } else {
                    Matcher vatShortMatcher = SUPPLIER_VAT_SHORT_PATTERN.matcher(line);
                    if (vatShortMatcher.find()) data.supplierVatNumber = vatShortMatcher.group(1).replaceAll("\\s+", "");
                }
            }

            if (data.supplierKvkNumber == null) {
                Matcher kvkMatcher = SUPPLIER_KVK_PATTERN.matcher(line);
                if (kvkMatcher.find()) data.supplierKvkNumber = kvkMatcher.group(1).trim();
            }

            if (data.supplierName == null) {
                Matcher holderMatcher = ACCOUNT_HOLDER_PATTERN.matcher(line);
                if (holderMatcher.find()) data.supplierName = holderMatcher.group(1).trim();
            }

            if (data.supplierName == null) {
                Matcher accountNameMatcher = ACCOUNT_NAME_PATTERN.matcher(line);
                if (accountNameMatcher.find()) data.supplierName = accountNameMatcher.group(1).trim();
            }

            if (data.supplierIban == null) {
                Matcher ibanMatcher = IBAN_PATTERN.matcher(line);
                if (ibanMatcher.find()) data.supplierIban = ibanMatcher.group(0).replaceAll("\\s+", "");
            }

            if (!inTable && TABLE_HEADER.matcher(lower).find()) {
                inTable = true;
                pendingDescription = null;
                continue;
            }

            if (!inTable) {
                continue;
            }

            if (expectingSubtotal) {
                BigDecimal amount = extractFirstAmount(line);
                if (amount != null) {
                    data.amountExclVat = amount;
                    expectingSubtotal = false;
                    continue;
                }
            }

            if (expectingVat) {
                BigDecimal amount = extractFirstAmount(line);
                if (amount != null) {
                    data.vatAmount = amount;
                    if (data.vatPercentage == null) data.vatPercentage = pendingVatPercentage;
                    expectingVat = false;
                    continue;
                }
            }

            if (expectingTotal) {
                BigDecimal amount = extractFirstAmount(line);
                if (amount != null) {
                    data.amountInclVat = amount;
                    expectingTotal = false;
                    continue;
                }
            }

            if (lower.startsWith("subtotaal") || lower.startsWith("totaal excl")) {
                BigDecimal amount = extractFirstAmount(line);
                if (amount != null) {
                    data.amountExclVat = amount;
                } else {
                    expectingSubtotal = true;
                }
                continue;
            }

            if (lower.startsWith("btw")) {
                Matcher vatMatcher = VAT_TOTAL_PATTERN.matcher(line);
                if (vatMatcher.find()) {
                    data.vatPercentage = parsePercentage(vatMatcher.group(1));
                    data.vatAmount = parseAmount(vatMatcher.group(2));
                    expectingVat = false;
                } else {
                    Matcher percentOnly = VAT_PERCENT_PATTERN.matcher(line);
                    if (percentOnly.find()) {
                        pendingVatPercentage = parsePercentage(percentOnly.group(1));
                        data.vatPercentage = pendingVatPercentage;
                    }
                    expectingVat = true;
                }
                continue;
            }

            if (lower.contains("totaal") && lower.contains("incl")) {
                BigDecimal amount = extractFirstAmount(line);
                if (amount != null) {
                    data.amountInclVat = amount;
                } else {
                    expectingTotal = true;
                }
                continue;
            }

            Matcher fullLine = LINE_FULL_PATTERN.matcher(line);
            if (fullLine.matches()) {
                data.lines.add(buildLine(
                        fullLine.group(1),
                        parseAmount(fullLine.group(2)),
                        parseAmount(fullLine.group(3)),
                        parsePercentage(fullLine.group(4)),
                        parseAmount(fullLine.group(5))));
                pendingDescription = null;
                continue;
            }

            Matcher numericOnly = LINE_NUMERIC_PATTERN.matcher(line);
            if (numericOnly.matches() && StringUtils.isNotBlank(pendingDescription)) {
                data.lines.add(buildLine(
                        pendingDescription,
                        parseAmount(numericOnly.group(1)),
                        parseAmount(numericOnly.group(2)),
                        parsePercentage(numericOnly.group(3)),
                        parseAmount(numericOnly.group(4))));
                pendingDescription = null;
                continue;
            }

            if (line.contains("€") || line.contains("%")) {
                pendingDescription = null;
                continue;
            }

            pendingDescription = pendingDescription == null
                    ? line
                    : (pendingDescription + " " + line);
        }

        if (StringUtils.isBlank(data.supplierBlockName)) {
            data.supplierBlockName = inferSupplierFromMarkers(lines);
        }
        if (StringUtils.isBlank(data.supplierName)) {
            data.supplierName = inferSupplierFromMarkers(lines);
        }

        if (data.amountInclVat == null && data.amountExclVat != null && data.vatAmount != null) {
            data.amountInclVat = data.amountExclVat.add(data.vatAmount);
        }

        return data;
    }

    private void evaluateBlocks(List<String> lines, StructuredExtraction data) {
        List<TextBlock> blocks = splitIntoBlocks(lines);

        // score each block
        blocks.forEach(block -> {
            block.supplierScore = computeSupplierScore(block);
            block.customerScore = computeCustomerScore(block);
        });

        blocks.stream()
                .max(Comparator.comparingInt(b -> b.supplierScore))
                .filter(block -> block.supplierScore >= 4)
                .filter(block -> block.customerScore < block.supplierScore)
                .ifPresent(block -> populateSupplierFromBlock(block, data));

        blocks.stream()
                .max(Comparator.comparingInt(b -> b.customerScore))
                .filter(block -> block.customerScore >= 3)
                .ifPresent(block -> populateCustomerFromBlock(block, data));
    }

    private List<TextBlock> splitIntoBlocks(List<String> lines) {
        List<TextBlock> blocks = new ArrayList<>();
        List<String> current = new ArrayList<>();
        int start = 0;

        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            if (StringUtils.isBlank(line)) {
                if (!current.isEmpty()) {
                    blocks.add(new TextBlock(start, i - 1, new ArrayList<>(current)));
                    current.clear();
                }
                start = i + 1;
            } else {
                if (current.isEmpty()) start = i;
                current.add(line);
            }
        }
        if (!current.isEmpty()) {
            blocks.add(new TextBlock(start, lines.size() - 1, current));
        }
        return blocks;
    }

    private int computeSupplierScore(TextBlock block) {
        int score = 0;
        String joinedLower = block.joinedLower();

        if (block.startIndex < 10) score += 1;
        if (joinedLower.contains("factuur")) score += 1;

        if (COMPANY_SUFFIXES.stream().anyMatch(block.firstLine()::contains)) score += 2;
        if (CAPITAL_PAIR.matcher(block.firstLine()).find()) score += 1;
        if (BRAND_UPPERCASE.matcher(block.firstLine()).matches()) score += 1;

        if (SUPPLIER_ANCHORS.stream().anyMatch(joinedLower::contains)) score += 3;

        long contactHits = block.lines.stream()
                .filter(line -> line.toLowerCase(Locale.ROOT).contains("tel")
                        || line.toLowerCase(Locale.ROOT).contains("phone")
                        || line.toLowerCase(Locale.ROOT).contains("mail")
                        || line.toLowerCase(Locale.ROOT).contains("email")
                        || line.toLowerCase(Locale.ROOT).contains("www"))
                .count();
        score += contactHits;

        if (SUPPLIER_NEGATIVE.stream().anyMatch(joinedLower::contains)) score -= 3;

        return score;
    }

    private int computeCustomerScore(TextBlock block) {
        int score = 0;
        String joinedLower = block.joinedLower();

        if (CUSTOMER_INDICATORS.stream().anyMatch(joinedLower::contains)) score += 3;
        if (joinedLower.contains("klantnummer") || joinedLower.contains("je nummer")) score += 1;
        if (joinedLower.contains("bill to") || joinedLower.contains("ship to")) score += 2;

        if (joinedLower.contains("btw") || joinedLower.contains("iban") || joinedLower.contains("kvk")) score -= 2;

        if (block.startIndex > 5 && block.startIndex < 40) score += 1;

        return score;
    }

    private void populateSupplierFromBlock(TextBlock block, StructuredExtraction data) {
        for (String line : block.lines) {
            if (looksLikeCompany(line) && !isCustomerKeyword(line)) {
                data.supplierBlockName = line.trim();
                break;
            }
        }
        for (String line : block.lines) {
            if (StringUtils.isBlank(data.supplierAddress) && containsStreetIndicator(line)) {
                data.supplierAddress = stripContactInfo(line);
            }
            Matcher postal = POSTAL_PATTERN.matcher(line);
            if (postal.find()) {
                data.supplierPostalCode = postal.group(1) + postal.group(2);
                String city = stripContactInfo(line.substring(postal.end()).trim());
                if (StringUtils.isNotBlank(city)) data.supplierCity = city;
            }
        }
    }

    private void populateCustomerFromBlock(TextBlock block, StructuredExtraction data) {
        if (StringUtils.isBlank(data.customerName)) {
            data.customerName = block.firstLine().trim();
        }
        for (String line : block.lines) {
            if (StringUtils.isBlank(data.customerAddress) && containsStreetIndicator(line)) {
                data.customerAddress = stripContactInfo(line);
            }
            Matcher postal = POSTAL_PATTERN.matcher(line);
            if (postal.find()) {
                data.customerPostalCode = postal.group(1) + postal.group(2);
                String city = stripContactInfo(line.substring(postal.end()).trim());
                if (StringUtils.isNotBlank(city)) data.customerCity = city;
            }
        }
    }

    private boolean isCustomerKeyword(String line) {
        String lower = line.toLowerCase(Locale.ROOT);
        return CUSTOMER_INDICATORS.stream().anyMatch(lower::contains);
    }

    private boolean looksLikeCompany(String line) {
        if (StringUtils.isBlank(line)) return false;
        String trimmed = line.trim();
        String lower = trimmed.toLowerCase(Locale.ROOT);

        if (SUPPLIER_NEGATIVE.stream().anyMatch(lower::contains)) return false;
        if (CUSTOMER_INDICATORS.stream().anyMatch(lower::contains)) return false;

        if (COMPANY_SUFFIXES.stream().anyMatch(trimmed::contains)) return true;
        if (CAPITAL_PAIR.matcher(trimmed).find()) return true;
        return BRAND_UPPERCASE.matcher(trimmed).matches();
    }



    private void extractCustomerBlock(List<String> lines, StructuredExtraction data) {
        int headerIndex = findTableHeaderIndex(lines);
        if (headerIndex <= 0) return;

        int start = 0;
        for (int i = 0; i < headerIndex; i++) {
            if (lines.get(i).toLowerCase(Locale.ROOT).contains("factuurdatum")) {
                start = i + 1;
            }
        }

        List<String> block = new ArrayList<>();
        for (int i = start; i < headerIndex; i++) {
            String normalized = leftColumn(lines.get(i));
            if (StringUtils.isBlank(normalized)) break;
            block.add(normalized);
        }

        if (block.isEmpty()) return;

        data.customerName = block.get(0).trim();
        for (int i = 1; i < block.size(); i++) {
            String entry = block.get(i);
            Matcher postal = POSTAL_PATTERN.matcher(entry);
            if (postal.find()) {
                data.customerPostalCode = postal.group(1) + postal.group(2);
                String city = stripContactInfo(entry.substring(postal.end()).trim());
                if (StringUtils.isNotBlank(city)) data.customerCity = city;
            } else if (StringUtils.isBlank(data.customerAddress) && containsStreetIndicator(entry)) {
                data.customerAddress = stripContactInfo(entry);
            } else if (StringUtils.isBlank(data.customerCountry) && isCountry(entry)) {
                data.customerCountry = entry.trim();
            }
        }

        if (StringUtils.isBlank(data.customerCountry)) {
            data.customerCountry = block.stream()
                    .filter(this::isCountry)
                    .findFirst()
                    .orElse(null);
        }
    }

    private void extractSupplierBlock(List<String> lines, StructuredExtraction data) {
        int markerIndex = -1;
        for (int i = lines.size() - 1; i >= 0; i--) {
            if (containsSupplierMarker(lines.get(i).toLowerCase(Locale.ROOT))) {
                markerIndex = i;
                break;
            }
        }
        if (markerIndex == -1) return;

        List<String> block = new ArrayList<>();
        for (int i = markerIndex - 1; i >= 0; i--) {
            String normalized = leftColumn(lines.get(i));
            if (StringUtils.isBlank(normalized)) break;
            block.add(0, normalized);
        }

        if (block.isEmpty()) return;

        String nameCandidate = block.get(0);
        if (looksLikeCompany(nameCandidate)) data.supplierBlockName = nameCandidate.trim();

        for (int i = 1; i < block.size(); i++) {
            String entry = block.get(i);
            Matcher postal = POSTAL_PATTERN.matcher(entry);
            if (postal.find()) {
                data.supplierPostalCode = postal.group(1) + postal.group(2);
                String city = stripContactInfo(entry.substring(postal.end()).trim());
                if (StringUtils.isNotBlank(city)) data.supplierCity = city;
            } else if (StringUtils.isBlank(data.supplierAddress) && containsStreetIndicator(entry)) {
                data.supplierAddress = stripContactInfo(entry);
            } else if (StringUtils.isBlank(data.supplierCountry) && isCountry(entry)) {
                data.supplierCountry = entry.trim();
            }
        }

        if (StringUtils.isBlank(data.supplierCountry)) {
            data.supplierCountry = block.stream()
                    .filter(this::isCountry)
                    .findFirst()
                    .orElse(null);
        }
    }

    private ParsedInvoiceLine buildLine(String description,
                                        BigDecimal quantity,
                                        BigDecimal unitPrice,
                                        BigDecimal vatPercentage,
                                        BigDecimal lineTotalExcl) {
        return ParsedInvoiceLine.builder()
                .description(description.trim())
                .quantity(quantity)
                .unitPrice(unitPrice)
                .vatPercentage(vatPercentage)
                .amountExclVat(lineTotalExcl)
                .amountInclVat(lineTotalExcl) // downstream logic compares to excl totals; keep the same
                .build();
    }

    private int findTableHeaderIndex(List<String> lines) {
        for (int i = 0; i < lines.size(); i++) {
            if (TABLE_HEADER.matcher(lines.get(i).toLowerCase(Locale.ROOT)).find()) {
                return i;
            }
        }
        return -1;
    }

    private BigDecimal parseAmount(String raw) {
        return raw == null ? null : new BigDecimal(raw.replace(".", "").replace(",", "."));
    }

    private BigDecimal parsePercentage(String raw) {
        return raw == null ? null : new BigDecimal(raw.replace("%", "").replace(",", "."));
    }

    private BigDecimal extractFirstAmount(String line) {
        Matcher matcher = AMOUNT_WITH_CURRENCY.matcher(line);
        return matcher.find() ? parseAmount(matcher.group(1)) : null;
    }

    private LocalDate parseDate(String raw) {
        if (raw == null) return null;
        String normalized = raw.trim()
                .replace('.', '-')
                .replace('/', '-')
                .replaceAll("\\s+", " ");
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(normalized, formatter);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private boolean containsStreetIndicator(String entry) {
        String lower = entry.toLowerCase(Locale.ROOT);
        return lower.contains("straat")
                || lower.contains("weg")
                || lower.contains("laan")
                || lower.contains("plein")
                || lower.matches(".*\\d+.*");
    }

    private boolean isCountry(String entry) {
        String normalized = entry.toLowerCase(Locale.ROOT).replaceAll("[^a-z]", "");
        return normalized.equals("nederland")
                || normalized.equals("belgie")
                || normalized.equals("belgium")
                || normalized.equals("deutschland")
                || normalized.equals("germany")
                || normalized.equals("frankrijk")
                || normalized.equals("france");
    }

    private String inferSupplierFromMarkers(List<String> lines) {
        for (int i = lines.size() - 1; i >= 0; i--) {
            String lower = lines.get(i).toLowerCase(Locale.ROOT);
            if (!containsSupplierMarker(lower)) continue;
            if (lower.contains("factuur") || lower.contains("omschrijving")) continue;
            String candidate = findCompanyAbove(lines, i - 1);
            if (StringUtils.isNotBlank(candidate)) return candidate;
        }
        return null;
    }

    private boolean containsSupplierMarker(String lower) {
        return lower.contains("btw")
                || lower.contains("btw-id")
                || lower.contains("kvk")
                || lower.contains("iban")
                || lower.contains("rekeningnummer")
                || lower.contains("bankrekening")
                || lower.contains("bank account");
    }

    private String findCompanyAbove(List<String> lines, int index) {
        for (int i = index; i >= 0; i--) {
            String candidate = leftColumn(lines.get(i));
            if (looksLikeCompany(candidate)) return candidate.trim();
        }
        return null;
    }

    private String leftColumn(String line) {
        String[] parts = line.split("\\s{2,}");
        return parts.length == 0 ? line.trim() : parts[0].trim();
    }

    private String stripContactInfo(String value) {
        if (value == null) return null;
        String lower = value.toLowerCase(Locale.ROOT);
        int idx = lower.indexOf("mobiel");
        if (idx == -1) idx = lower.indexOf("tel");
        if (idx == -1) idx = lower.indexOf("email");
        if (idx == -1) idx = lower.indexOf("kvk");
        if (idx == -1) idx = lower.indexOf("btw");
        if (idx == -1) idx = lower.indexOf("iban");
        if (idx == -1) idx = lower.indexOf("bank");
        return idx == -1 ? value.trim() : value.substring(0, idx).trim();
    }

    private static class TextBlock {
        final int startIndex;
        final int endIndex;
        final List<String> lines;
        int supplierScore;
        int customerScore;

        TextBlock(int startIndex, int endIndex, List<String> lines) {
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            this.lines = lines;
        }

        String firstLine() {
            return lines.isEmpty() ? "" : lines.get(0);
        }

        String joinedLower() {
            return lines.stream()
                    .map(line -> line.toLowerCase(Locale.ROOT))
                    .collect(Collectors.joining(" "));
        }
    }


    private static class StructuredExtraction {
        String invoiceNumber;
        LocalDate invoiceDate;
        LocalDate dueDate;

        String customerName;
        String customerAddress;
        String customerPostalCode;
        String customerCity;
        String customerCountry;

        String supplierName;
        String supplierBlockName;
        String supplierAddress;
        String supplierPostalCode;
        String supplierCity;
        String supplierCountry;
        String supplierVatNumber;
        String supplierKvkNumber;
        String supplierIban;

        BigDecimal amountExclVat;
        BigDecimal vatAmount;
        BigDecimal amountInclVat;
        BigDecimal vatPercentage;

        final List<ParsedInvoiceLine> lines = new ArrayList<>();
    }
}
