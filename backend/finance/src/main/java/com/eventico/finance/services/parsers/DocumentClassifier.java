//package com.eventico.finance.services.parsers;
//
//import lombok.RequiredArgsConstructor;
//import org.apache.pdfbox.Loader;
//import org.apache.pdfbox.pdmodel.PDDocument;
//import org.apache.pdfbox.text.PDFTextStripper;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.nio.file.Path;
//import java.util.Locale;
//
//@Component
//@RequiredArgsConstructor
//public class DocumentClassifier {
//
//    public boolean isInvoice(Path pdfPath) {
//        try (PDDocument doc = Loader.loadPDF(pdfPath.toFile())) {
//            String text = new PDFTextStripper().getText(doc).toLowerCase(Locale.ROOT);
//            return text.contains("invoice") || text.contains("factuur") || text.contains("rekening");
//        } catch (IOException e) {
//            throw new IllegalStateException("Cannot open PDF", e);
//        }
//    }
//}

package com.eventico.finance.services.parsers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DocumentClassifier {

    private static final Set<String> KEYWORDS = Set.of("invoice", "factuur", "rekening", "nota");

    public boolean isInvoice(Path pdfPath) {
        try (PDDocument doc = Loader.loadPDF(pdfPath.toFile())) {
            String text = new PDFTextStripper().getText(doc).toLowerCase(Locale.ROOT);
            String collapsed = text.replaceAll("\\s+", "");

            boolean keywordMatch = KEYWORDS.stream()
                    .anyMatch(keyword -> text.contains(keyword) || collapsed.contains(keyword));

            if (keywordMatch) {
                return true;
            }

            if (collapsed.isEmpty()) {
                log.debug("No extractable text in '{}'; treating as invoice to allow OCR fallback", pdfPath.getFileName());
                return true;
            }

            log.debug("Classifier did not find invoice keywords in '{}'", pdfPath.getFileName());
            return false;
        } catch (IOException e) {
            throw new IllegalStateException("Cannot open PDF " + pdfPath, e);
        }
    }
}
