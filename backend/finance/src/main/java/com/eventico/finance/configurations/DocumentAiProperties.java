package com.eventico.finance.configurations;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "document-ai")
public class DocumentAiProperties {

    private String credentialsPath;
    private String projectId;
    private String processorLocation = "eu";

    /** Optional: if you already know the processor ID, set it here. */
    private String processorId;

    /** Lookup/creation settings (defaults mirror the Python service). */
    private String processorType = "INVOICE_PROCESSOR";
    private String processorDisplayName = "Invoice Parser";
}