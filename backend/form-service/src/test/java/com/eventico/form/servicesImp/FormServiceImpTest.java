package com.eventico.form.servicesImp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FormServiceImpTest {

    @TempDir
    Path tempDirectory;

    @Test
    void attachmentPathUsesGeneratedNameWithinUploadRoot() {
        Path uploadRoot = tempDirectory.resolve("uploads");

        Path storedPath = FormServiceImp.resolveSafeAttachmentPath(uploadRoot, "../../outside/attachment.pdf");

        assertTrue(storedPath.startsWith(uploadRoot.toAbsolutePath().normalize()));
        assertTrue(storedPath.getFileName().toString().endsWith(".pdf"));
        assertFalse(storedPath.getFileName().toString().contains(".."));
    }
}
