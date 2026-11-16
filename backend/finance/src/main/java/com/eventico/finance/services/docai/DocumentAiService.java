package com.eventico.finance.services.docai;

import com.eventico.finance.configurations.AppProperties;
import com.eventico.finance.configurations.DocumentAiProperties;
import com.eventico.finance.services.parsers.ParsedInvoice;
import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.api.gax.rpc.ApiException;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.documentai.v1.CreateProcessorRequest;
import com.google.cloud.documentai.v1.Document;
import com.google.cloud.documentai.v1.Document.Entity;
import com.google.cloud.documentai.v1.DocumentProcessorServiceClient;
import com.google.cloud.documentai.v1.DocumentProcessorServiceSettings;
import com.google.cloud.documentai.v1.ProcessRequest;

import com.google.cloud.documentai.v1.Processor;
import com.google.cloud.documentai.v1.ProcessorName;
import com.google.cloud.documentai.v1.RawDocument;
import com.google.protobuf.ByteString;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Slf4j
@Service
public class DocumentAiService {

    private final DocumentAiProperties properties;
    private final AppProperties appProperties;

    private final DocumentProcessorServiceClient client;
    private final Object processorLock = new Object();
    private volatile String cachedProcessorId;
    private final ResourceLoader resourceLoader;
    public DocumentAiService(DocumentAiProperties properties, AppProperties appProperties, ResourceLoader loader) {
        this.properties = properties;
        this.appProperties = appProperties;
        this.resourceLoader = loader;
        this.client = initClient();
        this.cachedProcessorId = StringUtils.trimToNull(properties.getProcessorId());
    }

    public ParsedInvoice enhance(Path pdfPath, ParsedInvoice current) {
        if (!appProperties.isDocumentAiEnabled()) {
            return current;
        }
        String processorId = resolveProcessorId();
        if (processorId == null) {
            log.warn("Document AI processor not available; skipping fallback");
            return current;
        }

        try {
            byte[] pdfBytes = Files.readAllBytes(pdfPath);
            RawDocument raw = RawDocument.newBuilder()
                    .setContent(ByteString.copyFrom(pdfBytes))
                    .setMimeType("application/pdf")
                    .build();

            String name = ProcessorName.of(
                    properties.getProjectId(),
                    properties.getProcessorLocation(),
                    processorId).toString();

            ProcessRequest request = ProcessRequest.newBuilder()
                    .setName(name)
                    .setRawDocument(raw)
                    .build();

            Document doc = client.processDocument(request).getDocument();
            double confidence = averageConfidence(doc.getEntitiesList());

            Set<String> warnings = new HashSet<>(
                    current.getWarnings() == null ? Set.of() : current.getWarnings());

            ParsedInvoice.ParsedInvoiceBuilder builder = current.toBuilder()
                    .extractionMethod("document_ai")
                    .extractionConfidence(confidence);

            applyEntities(doc.getEntitiesList(), builder, warnings);
            if (confidence <= (current.getExtractionConfidence() == null ? 0.0 : current.getExtractionConfidence())) {
                builder.extractionConfidence(current.getExtractionConfidence());
            }
            return builder.build();
        } catch (Exception ex) {
            log.warn("Document AI fallback failed: {}", ex.getMessage());
            return current;
        }
    }

    private DocumentProcessorServiceClient initClient() {
        String location = properties.getCredentialsPath();
        if (StringUtils.isBlank(location)) {
            log.warn("Document AI credentials path not configured");
            return null;
        }
        Resource resource = resourceLoader.getResource(location);
        if (!resource.exists()) {
            log.warn("Document AI credential resource '{}' not found", location);
            return null;
        }
        try (InputStream in = resource.getInputStream()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(in)
                    .createScoped("https://www.googleapis.com/auth/cloud-platform");
            String endpoint = String.format("%s-documentai.googleapis.com:443",
                    properties.getProcessorLocation());
            DocumentProcessorServiceSettings settings = DocumentProcessorServiceSettings.newBuilder()
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .setEndpoint(endpoint)
                    .build();
            log.debug("Document AI client initialised using credentials '{}' and endpoint '{}'", location, endpoint);
            return DocumentProcessorServiceClient.create(settings);
        } catch (Exception ex) {
            log.warn("Failed to initialize Document AI client: {}", ex.getMessage());
            return null;
        }
    }


    private String resolveProcessorId() {
        if (StringUtils.isBlank(properties.getProjectId())) {
            log.debug("Document AI project id not configured");
            return null;
        }
        if (client == null) {
            log.debug("Document AI client not initialised (check credentials / API enablement)");
            return null;
        }
        if (cachedProcessorId != null) {
            log.debug("Using cached Document AI processor {}", cachedProcessorId);
            return cachedProcessorId;
        }

        synchronized (processorLock) {
            if (cachedProcessorId != null) {
                return cachedProcessorId;
            }
            if (StringUtils.isNotBlank(properties.getProcessorId())) {
                cachedProcessorId = properties.getProcessorId().trim();
                log.info("Using configured Document AI processor {}", cachedProcessorId);
                return cachedProcessorId;
            }

            String parent = String.format("projects/%s/locations/%s",
                    properties.getProjectId(),
                    properties.getProcessorLocation());

            try {
                log.debug("Listing processors under {}", parent);
                for (Processor processor : client.listProcessors(parent).iterateAll()) {
                    log.debug("Found processor {} (type {})", processor.getName(), processor.getType());
                    if (processor.getType().equalsIgnoreCase(properties.getProcessorType())) {
                        cachedProcessorId = processor.getName()
                                .substring(processor.getName().lastIndexOf('/') + 1);
                        log.info("Using existing Document AI processor {}", cachedProcessorId);
                        return cachedProcessorId;
                    }
                }

                log.info("No existing processor with type '{}'; creating new one", properties.getProcessorType());
                Processor request = Processor.newBuilder()
                        .setDisplayName(properties.getProcessorDisplayName())
                        .setType(properties.getProcessorType())
                        .build();

                Processor created = client.createProcessor(
                        CreateProcessorRequest.newBuilder()
                                .setParent(parent)
                                .setProcessor(request)
                                .build());

                cachedProcessorId = created.getName()
                        .substring(created.getName().lastIndexOf('/') + 1);
                log.info("Created new Document AI processor {}", cachedProcessorId);
                return cachedProcessorId;
            } catch (ApiException ex) {
                log.warn("Failed to resolve Document AI processor: {} (code {})",
                        ex.getMessage(), ex.getStatusCode().getCode());
                return null;
            }
        }
    }

    private double averageConfidence(List<Entity> entities) {
        return entities.stream()
                .mapToDouble(Entity::getConfidence)
                .average()
                .orElse(0.5);
    }

    private void applyEntities(List<Entity> entities, ParsedInvoice.ParsedInvoiceBuilder builder, Set<String> warnings) {
        for (Entity entity : entities) {
            String value = entity.getMentionText();
            if (StringUtils.isBlank(value)) {
                continue;
            }
            switch (entity.getType().toLowerCase(Locale.ROOT)) {
                case "invoice_id", "invoice_number" -> builder.invoiceNumber(value);
                case "invoice_date" -> builder.invoiceDate(parseDate(entity));
                case "due_date" -> builder.dueDate(parseDate(entity));
                case "supplier_name" -> builder.supplierName(value);
                case "supplier_address" -> builder.supplierAddress(value);
                case "supplier_tax_id" -> builder.supplierVatNumber(value);
                case "receiver_name" -> builder.customerName(value);
                case "receiver_address" -> builder.customerAddress(value);
                case "receiver_tax_id" -> builder.customerVatNumber(value);
                case "net_amount" -> builder.amountExclVat(parseAmount(value));
                case "total_tax_amount" -> builder.vatAmount(parseAmount(value));
                case "total_amount", "amount", "total_due" -> builder.amountInclVat(parseAmount(value));
                case "iban", "supplier_bank_acc", "bank_account" -> builder.supplierIban(value);
                case "payment_terms" -> builder.paymentTerms(value);
                case "payment_reference" -> builder.paymentReference(value);
                case "purchase_order", "purchase_order_number" -> builder.purchaseOrderNumber(value);
                case "service_period_start" -> builder.servicePeriodStart(parseDate(entity));
                case "service_period_end" -> builder.servicePeriodEnd(parseDate(entity));
                case "description" -> builder.descriptionSummary(value);
                case "project_reference" -> builder.projectReference(value);
                default -> warnings.add("Unhandled entity from Document AI: " + entity.getType());
            }
        }
        builder.warnings(warnings);
    }

    private LocalDate parseDate(Entity entity) {
        try {
            if (entity.hasNormalizedValue() && StringUtils.isNotBlank(entity.getNormalizedValue().getText())) {
                return LocalDate.parse(entity.getNormalizedValue().getText());
            }
            return LocalDate.parse(entity.getMentionText());
        } catch (Exception ex) {
            return null;
        }
    }

    private BigDecimal parseAmount(String text) {
        if (!StringUtils.isNotBlank(text)) {
            return null;
        }
        String normalized = text.replace("€", "").replace(",", ".").replaceAll("\\s", "");
        try {
            return new BigDecimal(normalized);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}
