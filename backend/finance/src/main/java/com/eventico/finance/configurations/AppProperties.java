package com.eventico.finance.configurations;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    @NotBlank
    private String environment;

    @NotBlank
    private String invoiceStorageDirectory;

    @Min(1)
    private int ocrTextThreshold = 100;

    private double ocrConfidenceThreshold = 0.7;

    private boolean documentAiEnabled = true;

    private double documentAiFallbackThreshold = 0.5;

    @NotEmpty
    private List<String> invoiceSearchTerms;

    @NotEmpty
    private List<String> emailFoldersToCheck;

    @Min(60)
    private int pollIntervalSeconds = 300;

    private MatchingProperties matching = new MatchingProperties();

    private TaskProperties task = new TaskProperties();

    private String officeHome;

    public Optional<Path> officeHomePath() {
        return StringUtils.isBlank(officeHome)
                ? Optional.empty()
                : Optional.of(Path.of(officeHome));
    }

    public Path storagePath() {
        return Path.of(invoiceStorageDirectory);
    }

    @Getter
    @Setter
    public static class MatchingProperties {
        private boolean relaxedMode = true;
        private double minConfidence = 0.45;
        private double autoConfirmThreshold = 0.85;
        private double weightReference = 0.30;
        private double weightAmount = 0.25;
        private double weightIban = 0.20;
        private double weightDate = 0.15;
        private double weightName = 0.10;
    }

    @Getter
    @Setter
    public static class TaskProperties {
        private String uri;
        private String name;
    }

    @Getter
    @Setter
    private String ocrDataPath;
}