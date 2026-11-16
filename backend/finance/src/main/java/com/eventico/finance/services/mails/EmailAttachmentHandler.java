package com.eventico.finance.services.mails;

import com.eventico.finance.configurations.AppProperties;
import com.microsoft.graph.models.Attachment;
import com.microsoft.graph.models.FileAttachment;
import com.microsoft.graph.models.Message;
import com.microsoft.graph.requests.GraphServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.jodconverter.core.document.DefaultDocumentFormatRegistry;
import org.jodconverter.core.office.OfficeManager;
import org.jodconverter.local.LocalConverter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailAttachmentHandler {

    private static final Set<String> WORD_EXTENSIONS = Set.of("doc", "docx");

    private final AppProperties properties;
    private final ObjectProvider<OfficeManager> officeManagerProvider;


    public List<MailAttachment> handle(GraphServiceClient<?> client,
                                       String mailbox,
                                       String folderId,
                                       List<Message> messages) {
        List<MailAttachment> result = new ArrayList<>();

        for (Message message : messages) {
            if (message.hasAttachments == null || !message.hasAttachments) {
                continue;
            }
            String messageId = message.id;
            try {
                List<Attachment> attachments =
                        client.users(mailbox).messages(messageId).attachments().buildRequest().get().getCurrentPage();

                for (Attachment attachment : attachments) {
                    if (!(attachment instanceof FileAttachment fileAttachment)) {
                        continue;
                    }
                    String filename = fileAttachment.name;
                    if (!looksLikeInvoice(filename)) {
                        continue;
                    }

                    byte[] bytes = fileAttachment.contentBytes;
                    if (bytes == null) {
                        log.warn("Skipping attachment {}: no contentBytes returned", filename);
                        continue;
                    }

                    Path stored = storeAttachment(filename, bytes);

                    Optional<Path> normalized = normalizeToPdf(stored, filename);
                    if (normalized.isEmpty()) {
                        log.warn("Skipping attachment {} until document conversion is available", filename);
                        continue;
                    }
                    Path normalizedPath = normalized.get();

                    result.add(MailAttachment.builder()
                            .messageId(messageId)
                            .subject(message.subject)
                            .from(message.from != null ? message.from.emailAddress.address : null)
                            .receivedAt(message.receivedDateTime == null ? OffsetDateTime.now() : message.receivedDateTime)
                            .originalFilename(filename)
                            .storedPath(normalizedPath)
                            .fileBytes(Files.readAllBytes(normalizedPath))
                            .folder(folderId)
                            .build());
                }
            } catch (Exception e) {
                log.warn("Failed to download attachment {}: {}", messageId, e.getMessage());
            }
        }
        return result;
    }

    private Optional<Path> normalizeToPdf(Path stored, String filename) throws Exception {
        String ext = FilenameUtils.getExtension(filename).toLowerCase(Locale.ROOT);

        if ("pdf".equals(ext)) {
            return Optional.of(stored);
        }
        if (WORD_EXTENSIONS.contains(ext)) {
            OfficeManager officeManager = officeManagerProvider.getIfAvailable();
            if (officeManager == null) {
                return Optional.empty();
            }
            Path destination = properties.storagePath()
                    .resolve("email")
                    .resolve(FilenameUtils.getBaseName(filename) + ".pdf");
            Files.createDirectories(destination.getParent());

            long sourceSize = Files.exists(stored) ? Files.size(stored) : -1;
            log.debug("Converting {} -> {} (exists={}, readable={}, size={})",
                    stored.toAbsolutePath(),
                    destination.toAbsolutePath(),
                    Files.exists(stored),
                    Files.isReadable(stored),
                    sourceSize);

            LocalConverter.make(officeManager)
                    .convert(stored.toFile())
                    .as(Objects.requireNonNull(DefaultDocumentFormatRegistry.getFormatByExtension(ext)))
                    .to(destination.toFile())
                    .execute();

            Files.deleteIfExists(stored);
            return Optional.of(destination);
        }
        return Optional.of(stored);
    }

    private Path storeAttachment(String filename, byte[] content) throws Exception {
        String safe = filename.replace("/", "-").replace("\\", "-");
        Path destination = properties.storagePath().resolve("email").resolve(safe);
        Files.createDirectories(destination.getParent());
        Files.write(destination, content);
        log.debug("Stored attachment {} ({} bytes)", destination.toAbsolutePath(), content.length);
        return destination;
    }

    private boolean looksLikeInvoice(String filename) {
        String ext = FilenameUtils.getExtension(filename).toLowerCase(Locale.ROOT);
        if (!WORD_EXTENSIONS.contains(ext) && !"pdf".equals(ext)) {
            return false;
        }
        String base = filename.toLowerCase(Locale.ROOT);
        return properties.getInvoiceSearchTerms().stream().anyMatch(base::contains);
    }
}
