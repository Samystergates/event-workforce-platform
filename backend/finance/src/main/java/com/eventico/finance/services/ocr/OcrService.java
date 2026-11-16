package com.eventico.finance.services.ocr;

import com.eventico.finance.configurations.AppProperties;
import com.eventico.finance.services.parsers.ParsedInvoice;
import com.eventico.finance.services.parsers.ParsedInvoice.ParsedInvoiceBuilder;
import lombok.RequiredArgsConstructor;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.opencv_core.Size;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import static org.bytedeco.opencv.global.opencv_imgcodecs.imread;
import static org.bytedeco.opencv.global.opencv_imgcodecs.imwrite;
import static org.bytedeco.opencv.global.opencv_imgproc.GaussianBlur;
import static org.bytedeco.opencv.global.opencv_imgproc.cvtColor;
import static org.bytedeco.opencv.global.opencv_imgproc.threshold;
import static org.bytedeco.opencv.global.opencv_imgproc.COLOR_BGR2GRAY;
import static org.bytedeco.opencv.global.opencv_imgproc.THRESH_BINARY;
import static org.bytedeco.opencv.global.opencv_imgproc.THRESH_OTSU;

@Service
@RequiredArgsConstructor
public class OcrService {

    private final AppProperties properties;

    public ParsedInvoice applyOcr(Path pdfPath, ParsedInvoice current) throws IOException, TesseractException {
        List<Path> images = renderPdfToImages(pdfPath);
        ParsedInvoiceBuilder builder = current.toBuilder()
                .extractionMethod("ocr")
                .extractionConfidence(properties.getOcrConfidenceThreshold());

        StringBuilder combinedText = new StringBuilder();
        for (Path image : images) {
            Path preprocessed = preprocess(image);
            combinedText.append(runOcr(preprocessed)).append("\n");
            Files.deleteIfExists(preprocessed);
            Files.deleteIfExists(image);
        }
        builder.pdfTextContent(combinedText.toString().trim());
        return builder.build();
    }

    public Path preprocess(Path imagePath) throws IOException {
        Mat mat = imread(imagePath.toString());
        Mat gray = new Mat();
        cvtColor(mat, gray, COLOR_BGR2GRAY);

        Mat denoised = new Mat();
        GaussianBlur(gray, denoised, new Size(3, 3), 0);

        Mat thresh = new Mat();
        threshold(denoised, thresh, 0, 255, THRESH_BINARY | THRESH_OTSU);

        Path temp = Files.createTempFile("ocr-", ".png");
        imwrite(temp.toString(), thresh);
        return temp;
    }

    private String runOcr(Path imagePath) throws TesseractException, IOException {
        Tesseract tesseract = new Tesseract();
        if (properties.getOcrDataPath() != null) {
            tesseract.setDatapath(properties.getOcrDataPath());
        }
        tesseract.setLanguage("nld+eng");
        return tesseract.doOCR(imagePath.toFile());
    }

    private List<Path> renderPdfToImages(Path pdfPath) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfPath.toFile())) {
            PDFRenderer renderer = new PDFRenderer(document);
            List<Path> images = new ArrayList<>();
            for (int page = 0; page < document.getNumberOfPages(); page++) {
                Path output = Files.createTempFile("invoice-page-", ".png");
                BufferedImage image = renderer.renderImageWithDPI(page, 300, ImageType.RGB);
                ImageIO.write(image, "PNG", output.toFile());
                images.add(output);
            }
            return images;
        }
    }
}