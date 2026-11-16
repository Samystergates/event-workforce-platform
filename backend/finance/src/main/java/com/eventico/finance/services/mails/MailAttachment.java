package com.eventico.finance.services.mails;

import lombok.Builder;
import lombok.Value;

import java.nio.file.Path;
import java.time.OffsetDateTime;

@Value
@Builder
public class MailAttachment {
    String messageId;
    String subject;
    String from;
    OffsetDateTime receivedAt;
    String originalFilename;
    Path storedPath;
    byte[] fileBytes;
    String folder;
}