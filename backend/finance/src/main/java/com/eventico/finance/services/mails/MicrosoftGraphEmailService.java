package com.eventico.finance.services.mails;


import com.eventico.finance.configurations.AppProperties;
import com.eventico.finance.configurations.MsGraphProperties;
import com.microsoft.graph.models.Message;
import com.microsoft.graph.requests.GraphServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "msgraph", name = "enabled", havingValue = "true")
public class MicrosoftGraphEmailService {

    private final MicrosoftGraphClientProvider clientProvider;
    private final AppProperties appProperties;
    private final MsGraphProperties graphProperties;
    private final EmailAttachmentHandler attachmentHandler;

    public List<MailAttachment> fetchInvoiceAttachments(String mailbox, Integer daysBack, String folderPath) {
        GraphServiceClient<?> client = clientProvider.graphClient();
        int effectiveLookback = daysBack == null ? 30 : Math.max(1, daysBack);
        OffsetDateTime since = OffsetDateTime.now().minusDays(effectiveLookback);
        List<String> folders = folderPath != null ? List.of(folderPath) : appProperties.getEmailFoldersToCheck();
        List<MailAttachment> attachments = new ArrayList<>();

        for (String folder : folders) {
            String folderId = resolveFolderId(client, mailbox, folder);
            if (folderId == null) {
                continue;
            }
            List<Message> messages = client.users(mailbox)
                    .mailFolders(folderId)
                    .messages()
                    .buildRequest()
                    .filter(buildFilter(since))
                    .top(graphProperties.getMaxEmailsPerPoll())
                    .select("id,subject,from,receivedDateTime,parentFolderId,hasAttachments")
                    .get()
                    .getCurrentPage();

            attachments.addAll(attachmentHandler.handle(client, mailbox, folderId, messages));
        }
        return attachments;
    }

    private String resolveFolderId(GraphServiceClient<?> client, String mailbox, String path) {
        try {
            var folders = client.users(mailbox).mailFolders().buildRequest().get().getCurrentPage();
            String[] parts = path.split("/");
            String currentId = null;
            List<com.microsoft.graph.models.MailFolder> current = folders;
            for (String part : parts) {
                boolean found = false;
                for (com.microsoft.graph.models.MailFolder folder : current) {
                    if (folder.displayName.equalsIgnoreCase(part)) {
                        currentId = folder.id;
                        current = client.users(mailbox).mailFolders(currentId).childFolders().buildRequest().get().getCurrentPage();
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    log.warn("Folder {} not found", path);
                    return null;
                }
            }
            return currentId;
        } catch (Exception e) {
            log.warn("Failed to resolve folder {}: {}", path, e.getMessage());
            return null;
        }
    }

    private String buildFilter(OffsetDateTime since) {
        String keywords = appProperties.getInvoiceSearchTerms().stream()
                .map(term -> "(contains(subject,'" + term + "'))")
                .collect(Collectors.joining(" OR "));

        String dateLiteral = DateTimeFormatter.ISO_INSTANT.format(since.toInstant());
        return "hasAttachments eq true and receivedDateTime ge " + dateLiteral + " and (" + keywords + ")";
    }


}