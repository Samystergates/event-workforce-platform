package com.rentmen.app.services.imp;

import com.rentmen.app.DTO.JobDto;
import com.rentmen.app.entities.Invoice;
import com.rentmen.app.entities.Job;
import com.rentmen.app.entities.User;
import com.rentmen.app.exceptions.ResourceNotFoundException;
import com.rentmen.app.repositories.InvoiceRepo;
import com.rentmen.app.repositories.JobRepo;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class JobAuthorizationService {
    private final JobRepo jobRepo;
    private final InvoiceRepo invoiceRepo;

    public JobAuthorizationService(JobRepo jobRepo, InvoiceRepo invoiceRepo) {
        this.jobRepo = jobRepo;
        this.invoiceRepo = invoiceRepo;
    }

    public void assertCanCreateJob(JobDto dto) {
        User user = currentUser();
        if (isAdmin(user)) return;
        Long currentId = user.getId();
        boolean ownsClient = user.getDepId() != null && user.getDepId() == 1
                && dto.getClient() != null && currentId == dto.getClient().getId();
        boolean ownsModerator = user.getDepId() != null && user.getDepId() == 2
                && dto.getModerator() != null && currentId == dto.getModerator().getId();
        boolean createdBySelf = dto.getCreatedBy() != null && currentId == dto.getCreatedBy().getId();
        if (!(ownsClient || ownsModerator) || !createdBySelf) {
            throw new AccessDeniedException("Only a client or assigned moderator can create a job for their own account");
        }
    }

    public void assertCanUpdateJob(JobDto dto) {
        Job existing = findJob(dto.getId());
        assertCanManage(existing);
        User user = currentUser();
        if (isAdmin(user)) return;
        if (dto.getClient() == null || !sameId(existing.getClient().getId(), dto.getClient().getId())
                || !sameId(existing.getModerator() == null ? null : existing.getModerator().getId(),
                dto.getModerator() == null ? null : dto.getModerator().getId())
                || dto.getCreatedBy() == null || existing.getCreatedBy() == null
                || !sameId(existing.getCreatedBy().getId(), dto.getCreatedBy().getId())) {
            throw new AccessDeniedException("Job ownership cannot be changed by this account");
        }
    }

    public void assertCanReadJob(Long jobId) {
        Job job = findJob(jobId);
        User user = currentUser();
        if (isAdmin(user) || ownsJob(user, job)
                || job.getServiceProvidersList().stream().anyMatch(provider -> provider.getId() == user.getId())) {
            return;
        }
        throw new AccessDeniedException("You do not have access to this job");
    }

    public void assertCanManageJob(Long jobId) {
        assertCanManage(findJob(jobId));
    }

    public void assertCanManageInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", invoiceId));
        User user = currentUser();
        if (isAdmin(user) || (invoice.getJob() != null && ownsJob(user, invoice.getJob()))) {
            return;
        }
        throw new AccessDeniedException("You do not have access to this invoice");
    }

    public void assertCanAccessInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", invoiceId));
        User user = currentUser();
        if (isAdmin(user) || (invoice.getJob() != null && ownsJob(user, invoice.getJob()))
                || (invoice.getServiceProvider() != null && invoice.getServiceProvider().getId() == user.getId())) {
            return;
        }
        throw new AccessDeniedException("You do not have access to this invoice");
    }

    public void assertCanUpdateTimesheet(Long invoiceId) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", invoiceId));
        User user = currentUser();
        if (isAdmin(user) || (invoice.getJob() != null && ownsJob(user, invoice.getJob()))
                || (invoice.getServiceProvider() != null && invoice.getServiceProvider().getId() == user.getId())) {
            return;
        }
        throw new AccessDeniedException("You do not have permission to update this timesheet");
    }

    public void assertCanReadAllJobs() {
        if (!isAdmin(currentUser())) {
            throw new AccessDeniedException("Listing all jobs requires an administrator account");
        }
    }

    public void assertCanAccessClientOrModeratorId(Long requestedId, boolean moderator) {
        User user = currentUser();
        if (isAdmin(user)) return;
        int requiredDepartment = moderator ? 2 : 1;
        if (user.getDepId() == null || user.getDepId() != requiredDepartment || user.getId() != requestedId) {
            throw new AccessDeniedException("You can only access records belonging to your account");
        }
    }

    public void assertCanAccessAccountId(Long requestedId, int departmentId) {
        User user = currentUser();
        if (!isAdmin(user) && (user.getDepId() == null || user.getDepId() != departmentId
                || user.getId() != requestedId)) {
            throw new AccessDeniedException("You can only access records belonging to your account");
        }
    }

    public void assertCanActAsServiceProvider(Long requestedId) {
        User user = currentUser();
        if (!isAdmin(user) && (user.getDepId() == null || user.getDepId() != 3 || user.getId() != requestedId)) {
            throw new AccessDeniedException("You can only act for your own service-provider account");
        }
    }

    public void assertCanReadAllInvoices() {
        if (!isAdmin(currentUser())) {
            throw new AccessDeniedException("Listing all invoices requires an administrator account");
        }
    }

    public void assertCanAccessOwnId(Long requestedId) {
        User user = currentUser();
        if (!isAdmin(user) && user.getId() != requestedId) {
            throw new AccessDeniedException("You can only access records belonging to your account");
        }
    }

    public void assertAdministrator() {
        if (!isAdmin(currentUser())) {
            throw new AccessDeniedException("Administrator authority is required");
        }
    }

    private void assertCanManage(Job job) {
        User user = currentUser();
        if (!isAdmin(user) && !ownsJob(user, job)) {
            throw new AccessDeniedException("You do not have permission to change this job");
        }
    }

    private boolean ownsJob(User user, Job job) {
        long id = user.getId();
        return (job.getClient() != null && job.getClient().getId() == id)
                || (job.getModerator() != null && job.getModerator().getId() == id)
                || (job.getCreatedBy() != null && job.getCreatedBy().getId() == id);
    }

    private boolean isAdmin(User user) {
        return user.getAuthorities().stream().anyMatch(authority ->
                "ROLE_ADMIN".equals(authority.getAuthority()) || "ADMIN".equals(authority.getAuthority()));
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new AccessDeniedException("A core user account is required");
    }

    private Job findJob(Long id) {
        return jobRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));
    }

    private boolean sameId(Long left, Long right) {
        return left == null ? right == null : left.equals(right);
    }
}
