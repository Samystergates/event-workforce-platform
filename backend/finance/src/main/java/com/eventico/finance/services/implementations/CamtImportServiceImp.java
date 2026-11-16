package com.eventico.finance.services.implementations;


import com.eventico.finance.dtos.BankImportResponse;
import com.eventico.finance.entities.BankTransaction;
import com.eventico.finance.repositories.BankTransactionRepository;
import com.eventico.finance.services.CamtImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.XMLConstants;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class CamtImportServiceImp implements CamtImportService {

    private final BankTransactionRepository transactionRepository;
    private static final String CAMT_NS = "urn:iso:std:iso:20022:tech:xsd:camt.053.001.02";

    @Override
    @Transactional
    public BankImportResponse importFile(MultipartFile file) {
        int saved = 0;
        int duplicates = 0;
        int parsed = 0;

        try (InputStream in = file.getInputStream()) {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            factory.setIgnoringComments(true);
            factory.setIgnoringElementContentWhitespace(true);
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");

            Document document = factory.newDocumentBuilder().parse(in);
            Element root = document.getDocumentElement();
            if (!CAMT_NS.equals(root.getNamespaceURI())) {
                throw new IllegalStateException("Unexpected CAMT namespace: " + root.getNamespaceURI());
            }

            NodeList entries = root.getElementsByTagNameNS(CAMT_NS, "Ntry");
            parsed = entries.getLength();
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE;

            for (int i = 0; i < parsed; i++) {
                Element entry = (Element) entries.item(i);

                Element amtEl = firstChildElement(entry, CAMT_NS, "Amt");
                if (amtEl == null) {
                    log.warn("Skipping entry without amount for {}", file.getOriginalFilename());
                    continue;
                }
                BigDecimal amt = new BigDecimal(amtEl.getTextContent());

                Element cdtDbtEl = firstChildElement(entry, CAMT_NS, "CdtDbtInd");
                if (cdtDbtEl == null) {
                    log.warn("Skipping entry without CdtDbtInd for {}", file.getOriginalFilename());
                    continue;
                }
                String cdtDbt = cdtDbtEl.getTextContent();

                Element bookgDtEl = firstChildElement(entry, CAMT_NS, "BookgDt");
                if (bookgDtEl == null) {
                    log.warn("Skipping entry without booking date for {}", file.getOriginalFilename());
                    continue;
                }
                Element dateEl = firstChildElement(bookgDtEl, CAMT_NS, "Dt");
                if (dateEl == null) {
                    log.warn("Skipping entry with empty booking date for {}", file.getOriginalFilename());
                    continue;
                }
                LocalDate bookingDate = LocalDate.parse(dateEl.getTextContent(), formatter);

                String debtorName = textOrNull(entry, "Dbtr");
                String creditorName = textOrNull(entry, "Cdtr");
                String debtorIban = textOrNull(entry, "DbtrAcct");
                String creditorIban = textOrNull(entry, "CdtrAcct");
                String remittance = textOrNull(entry, "Ustrd");
                String endToEnd = textOrNull(entry, "EndToEndId");

                if ("DBIT".equalsIgnoreCase(cdtDbt)) {
                    amt = amt.negate();
                }

                String hash = DigestUtils.sha256Hex(
                        bookingDate + ":" + amt + ":" + creditorIban + ":" + debtorIban + ":" + remittance);

                if (transactionRepository.findByTransactionId(hash).isPresent()) {
                    duplicates++;
                    continue;
                }

                BankTransaction transaction = new BankTransaction();
                transaction.setTransactionId(hash);
                transaction.setBookingDate(bookingDate);
                transaction.setAmount(amt);
                transaction.setCurrency("EUR");
                transaction.setDebtorName(debtorName);
                transaction.setDebtorIban(debtorIban);
                transaction.setCreditorName(creditorName);
                transaction.setCreditorIban(creditorIban);
                transaction.setRemittanceInfo(remittance);
                transaction.setEndToEndId(endToEnd);
                transaction.setCamtFileName(file.getOriginalFilename());
                transactionRepository.save(transaction);
                saved++;
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse CAMT file", e);
        }
        return new BankImportResponse(file.getOriginalFilename(), parsed, saved, duplicates);
    }

    private Element firstChildElement(Element parent, String ns, String localName) {
        NodeList list = parent.getElementsByTagNameNS(ns, localName);
        return list.getLength() > 0 ? (Element) list.item(0) : null;
    }

    private String textOrNull(Element parent, String localName) {
        Element el = firstChildElement(parent, CAMT_NS, localName);
        return el != null ? el.getTextContent() : null;
    }

}