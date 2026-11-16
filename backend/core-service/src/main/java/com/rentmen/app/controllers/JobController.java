
package com.rentmen.app.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.rentmen.app.DTO.*;
import com.rentmen.app.configurations.JwtTokenHelper;
import com.rentmen.app.entities.Invoice;
import com.rentmen.app.services.JobService;
import com.rentmen.app.services.imp.JobAuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/job"})
@CrossOrigin
public class JobController {
    @Value("${upload.dir}")
    private String uploadDir;

    @Autowired
    private JobService jobService;
    @Autowired
    private JwtTokenHelper jwtTokenHelper;
    @Autowired
    private JobAuthorizationService jobAuthorizationService;

    public JobController() {
    }

    @PostMapping({"/createJob"})
    public ResponseEntity<?> createJob(@RequestBody JobDto job) {
        jobAuthorizationService.assertCanCreateJob(job);
        JobDto createdJob = this.jobService.createJob(job);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
    }

    @GetMapping({"/delete-job/{id}"})
    public Map<String, Boolean> deleteJob(@PathVariable Long id) {
        jobAuthorizationService.assertCanManageJob(id);
        Map<String, Boolean> response = new HashMap<>();
        Boolean isDeleted = this.jobService.deleteJob(id);
        if (isDeleted) {
            response.put("success", true);
            return response;
        } else {
            response.put("success", false);
            return response;
        }
    }

    @PostMapping({"/updateJob"})
    public ResponseEntity<?> updateJob(@RequestBody JobDto job) {
        jobAuthorizationService.assertCanUpdateJob(job);
        JobDto updatedJob = this.jobService.updateJob(job);
        return ResponseEntity.ok(updatedJob);
    }

    @GetMapping({"/getJob/{jobId}"})
    public ResponseEntity<JobDto> getJob(@PathVariable("jobId") Long jobId) {
        jobAuthorizationService.assertCanReadJob(jobId);
        return ResponseEntity.ok(this.jobService.getJobById(jobId));
    }

    @GetMapping({"/getAllJobs"})
    public ResponseEntity<List<JobDto>> getAllJobs() {
        jobAuthorizationService.assertCanReadAllJobs();
        List<JobDto> dto = this.jobService.getAllJobs();
        return ResponseEntity.ok(dto);
    }

    @GetMapping({"/getAllJobsByClientId/{clientId}"})
    public ResponseEntity<List<JobDto>> getAllJobsByClientId(@PathVariable("clientId") Long clientId) {
        jobAuthorizationService.assertCanAccessClientOrModeratorId(clientId, false);
        List<JobDto> dto = this.jobService.getAllJobsByClientId(clientId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping({"/getAllJobsByModeratorId/{moderatorId}"})
    public ResponseEntity<List<JobDto>> getAllJobsByModeratorId(@PathVariable("moderatorId") Long moderatorId) {
        jobAuthorizationService.assertCanAccessClientOrModeratorId(moderatorId, true);
        return ResponseEntity.ok(this.jobService.getAllJobsByModeratorId(moderatorId));
    }

    @GetMapping({"/getAllJobsServiceProviderIds/{serviceProviderIds}"})
    public ResponseEntity<List<JobDto>> getAllJobsServiceProviderId(@PathVariable("serviceProviderIds") List<Long> serviceProviderIds) {
        serviceProviderIds.forEach(jobAuthorizationService::assertCanActAsServiceProvider);
        return ResponseEntity.ok(this.jobService.getAllJobsServiceProviderIds(serviceProviderIds));
    }

    @GetMapping({"/getAllJobsCreatedById/{createdById}"})
    public ResponseEntity<List<JobDto>> getAllJobsCreatedById(@PathVariable("createdById") Long createdById) {
        jobAuthorizationService.assertCanAccessOwnId(createdById);
        return ResponseEntity.ok(this.jobService.getAllJobsCreatedById(createdById));
    }

    @GetMapping({"/getPotentialJobsOfferedToServiceProvider/{serviceProviderIds}"})
    public ResponseEntity<List<JobDto>> getPotentialJobsOfferedToServiceProvider(@PathVariable("serviceProviderIds") Set<Long> serviceProviderIds) {
        serviceProviderIds.forEach(jobAuthorizationService::assertCanActAsServiceProvider);
        return ResponseEntity.ok(this.jobService.getPotentialJobsOfferedToServiceProvider(serviceProviderIds));
    }

    @GetMapping({"/getPotentialJobOffersToServiceProvider/{serviceProviderId}"})
    public ResponseEntity<List<PotentialJobOfferDto>> getPotentialJobOffersToServiceProvider(@PathVariable("serviceProviderId") Long serviceProviderId) {
        jobAuthorizationService.assertCanActAsServiceProvider(serviceProviderId);
        return ResponseEntity.ok(this.jobService.getPotentialJobOffersToServiceProvider(serviceProviderId));
    }

    @PostMapping({"/acceptJobOffers"})
    public ResponseEntity<?> acceptJobOffers(@RequestBody List<PotentialJobOfferDto> pjoDto) {
        if (pjoDto == null || pjoDto.isEmpty()) {
            return ResponseEntity.badRequest().body("At least one job offer is required");
        }
        jobAuthorizationService.assertCanActAsServiceProvider(pjoDto.get(0).getServiceProviderId());
        List<Long> jobIds = (List) pjoDto.stream().map(PotentialJobOfferDto::getJobId).collect(Collectors.toList());
        this.jobService.acceptJobOffers(jobIds, ((PotentialJobOfferDto) pjoDto.get(0)).getServiceProviderId());
        return ResponseEntity.ok("Updated");
    }

    @GetMapping({"/acceptJobOfferFromEmail"})
    public ResponseEntity<?> acceptJobOffersFromEmail(@RequestParam String token) {
        if (!this.jwtTokenHelper.validateJobOfferAcceptanceToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired acceptance link");
        }
        Long jobId = this.jwtTokenHelper.getJobIdFromJobOfferAcceptanceToken(token);
        Long userId = this.jwtTokenHelper.getUserIdFromJobOfferAcceptanceToken(token);
        this.jobService.acceptJobOffers(Collections.singletonList(jobId), userId);
        return ResponseEntity.ok("Updated");
    }

    @PostMapping({"/rejectJobOffers"})
    public ResponseEntity<?> rejectJobOffers(@RequestBody List<PotentialJobOfferDto> pjoDto) {
        if (pjoDto == null || pjoDto.isEmpty()) {
            return ResponseEntity.badRequest().body("At least one job offer is required");
        }
        jobAuthorizationService.assertCanActAsServiceProvider(pjoDto.get(0).getServiceProviderId());
        List<Long> jobIds = (List) pjoDto.stream().map(PotentialJobOfferDto::getJobId).collect(Collectors.toList());
        this.jobService.rejectJobOffers(jobIds, ((PotentialJobOfferDto) pjoDto.get(0)).getServiceProviderId());
        return ResponseEntity.ok("Updated");
    }

    @GetMapping({"/review-form/client/{token}"})
    public ResponseEntity<?> getClientReviewForm(@PathVariable("token") String token) {
        try {
            return ResponseEntity.ok(this.jobService.getClientReviewForm(token));
        } catch (Exception var3) {
            Exception e = var3;
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping({"/review-form/client"})
    public ResponseEntity<?> postClientReviewForm(@RequestParam("token") String token, @RequestBody List<ReviewFormClient> reviews) throws Exception {
        this.jobService.postClientReviewForm(token, reviews);
        return ResponseEntity.ok("review posted successfully");
    }

    @GetMapping({"/review-form/getToken/{jobId}"})
    public ResponseEntity<?> getReviewToken(@PathVariable("jobId") String jobId) {
        jobAuthorizationService.assertCanManageJob(Long.parseLong(jobId));
        return ResponseEntity.ok(this.jwtTokenHelper.generateTokenForReviewForm(jobId, null));
    }

    @GetMapping({"/review-form/service-provider-is-filled/{spId}"})
    public ResponseEntity<?> isReviewedServiceProviderReviewForm(@RequestParam("token") String token, @PathVariable("spId") Long spId) throws Exception {
        return ResponseEntity.ok(this.jobService.isReviewedServiceProviderReviewForm(token, spId));
    }

    @GetMapping({"/review-form/service-provider-is-overridden/{spId}"})
    public ResponseEntity<?> isOverriddenByClientServiceProviderReviewForm(@RequestParam("token") String token, @PathVariable("spId") Long spId) throws Exception {
        return ResponseEntity.ok(this.jobService.isOverriddenByClientBeforeServiceProviderReviewForm(token, spId));
    }

    @PostMapping(value = "/review-form/service-provider", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> postReviewFormServiceProvider(
            @RequestParam("token") String token,
            @RequestPart("invoice") String invoiceJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        InvoiceDto invoice = objectMapper.readValue(invoiceJson, InvoiceDto.class);

        invoice.setFiles(files);
        jobService.postReviewFormServiceProvider(token, invoice);
        return ResponseEntity.ok("Success: review form posted successfully");
    }


    @GetMapping({"/get-punches/{jobIds}"})
    public ResponseEntity<?> generateInvoice(@PathVariable("jobIds") List<Long> jobIds) throws Exception {
        jobAuthorizationService.assertAdministrator();
        return ResponseEntity.ok(this.jobService.getPunchedDetailsByJobIds(jobIds));
    }

    @GetMapping({"/generateInvoice/{jobId}"})
    public ResponseEntity<?> generateInvoice(@PathVariable("jobId") Long jobId) throws Exception {
        jobAuthorizationService.assertCanManageJob(jobId);
        return ResponseEntity.ok(this.jobService.getInvoice(jobId));
    }

    @PostMapping({"/create-invoices-po/{jobId}"})
    public ResponseEntity<?> createInvoice(@PathVariable("jobId") Long jobId) throws Exception {
        jobAuthorizationService.assertCanManageJob(jobId);
        List<Invoice> invoices = new ArrayList<>();
        Invoice clientInvoice = this.jobService.createInvoice(jobId);
        List<Invoice> serviceProvidersInvoices = this.jobService.createAllPurchaseOrders(jobId);
        invoices.add(clientInvoice);
        invoices.addAll(serviceProvidersInvoices);
        return ResponseEntity.ok(invoices);
    }

    @PostMapping({"/merge-invoices/{invoiceNumber}"})
    public ResponseEntity<?> mergeInvoice(@PathVariable("invoiceNumber") Long invoiceNumber, @RequestBody List<Long> jobIds) throws Exception {
        jobAuthorizationService.assertAdministrator();
        Invoice mergedInvoice = this.jobService.mergeInvoices(invoiceNumber, jobIds);
        return ResponseEntity.ok(mergedInvoice);
    }

    @GetMapping({"/manual-sms/{jobId}"})
    public ResponseEntity<?> manualMessage(@PathVariable("jobId") Long jobId) throws Exception {
        jobAuthorizationService.assertCanManageJob(jobId);
        Boolean messageSent = this.jobService.sendManualMessageToSP(jobId);
        return ResponseEntity.ok(Collections.singletonMap("success", messageSent));
    }

    @PutMapping({"/update-invoice/{invoiceId}"})
    public ResponseEntity<?> updateInvoice(@PathVariable("invoiceId") Long invoiceId, @RequestBody Invoice invoice) throws Exception {
        jobAuthorizationService.assertCanManageInvoice(invoiceId);
        Invoice updatedInvoice = this.jobService.updateInvoice(invoiceId, invoice);
        return ResponseEntity.ok(updatedInvoice);
    }

    @PutMapping({"/update-invoice-timesheet/"})
    public ResponseEntity<?> updateInvoiceTimesheet(@RequestBody InvoiceDto invoiceDto) throws Exception {
        jobAuthorizationService.assertCanUpdateTimesheet((long) invoiceDto.getId());
        InvoiceDto updatedInvoice = this.jobService.updateInvoiceTimesheet(invoiceDto);
        return ResponseEntity.ok(updatedInvoice);
    }

    @DeleteMapping({"/delete-invoice/{invoiceId}"})
    public ResponseEntity<?> updatePurchaseOrder(@PathVariable("invoiceId") Long invoiceId) throws Exception {
        jobAuthorizationService.assertCanManageInvoice(invoiceId);
        Boolean deleted = this.jobService.deleteInvoice(invoiceId);
        return ResponseEntity.ok(deleted);
    }

    @GetMapping({"/list"})
    public ResponseEntity<?> getAllInvoices() throws Exception {
        jobAuthorizationService.assertCanReadAllInvoices();
        return ResponseEntity.ok(this.jobService.getAllInvoices());
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) throws IOException {
        jobAuthorizationService.assertAdministrator();
        Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path path = uploadRoot.resolve(filename).normalize();
        if (!path.startsWith(uploadRoot)) {
            return ResponseEntity.badRequest().build();
        }
        Resource resource = new UrlResource(path.toUri());

        if (resource.exists()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/files/invoice/{invoiceId}")
    public ResponseEntity<List<Resource>> getFilesByInvoiceId(@PathVariable Long invoiceId) throws IOException {
        jobAuthorizationService.assertCanAccessInvoice(invoiceId);
        List<Resource> files = jobService.getFilesForInvoice(invoiceId);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/invoice/print-pdf/{invoiceId}")
    public ResponseEntity<byte[]> generateInvoicePdf(@PathVariable("invoiceId") Long invoiceId) {
        try {
            jobAuthorizationService.assertCanAccessInvoice(invoiceId);
            byte[] pdfBytes = jobService.generatePdf(invoiceId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename("invoice-" + invoiceId + ".pdf")
                    .build());
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }


    @GetMapping("/file/{imageName}")
    public ResponseEntity<Resource> getImage(@PathVariable String imageName) throws IOException {
        jobAuthorizationService.assertAdministrator();
        Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path imagePath = uploadRoot.resolve(imageName).normalize();
        if (!imagePath.startsWith(uploadRoot) || !Files.isRegularFile(imagePath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(imagePath.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // You can dynamically set the correct content type
                .body(resource);
    }
}
