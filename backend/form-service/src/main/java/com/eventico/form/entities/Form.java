package com.eventico.form.entities;

import com.eventico.form.dtos.ServiceProviderDto;
import com.eventico.form.utils.FormStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(
        name = "form"
)
public class Form {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private Double kilometer;

    @Column(name = "extra_cost")
    private Double extraCost;

    @Column(name = "extra_cost_description")
    private String extraCostDescription;

    @Column(name = "break_minutes")
    private LocalTime breakMinutes;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "service_provider_id")
    private Long serviceProviderId;

    @Column(name = "job_id")
    private Long jobId;

    @Column(name = "own_car")
    private Boolean ownCar;

    @Transient
    List<MultipartFile> files;

    @ElementCollection
    @CollectionTable(name = "form_files", joinColumns = @JoinColumn(name = "id"))
    @Column(name = "file_path")
    List<String> filePath;

    @Column(name = "created_date_time")
    private LocalDateTime createdDateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "form_status")
    private FormStatus status;

    @Transient
    private ServiceProviderDto serviceProvider;

    public ServiceProviderDto getServiceProvider() {
        return serviceProvider;
    }

    public void setServiceProvider(ServiceProviderDto serviceProvider) {
        this.serviceProvider = serviceProvider;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getKilometer() {
        return kilometer;
    }

    public void setKilometer(Double kilometer) {
        this.kilometer = kilometer;
    }

    public Double getExtraCost() {
        return extraCost;
    }

    public void setExtraCost(Double extraCost) {
        this.extraCost = extraCost;
    }

    public String getExtraCostDescription() {
        return extraCostDescription;
    }

    public void setExtraCostDescription(String extraCostDescription) {
        this.extraCostDescription = extraCostDescription;
    }

    public LocalTime getBreakMinutes() {
        return breakMinutes;
    }

    public void setBreakMinutes(LocalTime breakMinutes) {
        this.breakMinutes = breakMinutes;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public List<MultipartFile> getFiles() {
        return files;
    }

    public void setFiles(List<MultipartFile> files) {
        this.files = files;
    }

    public List<String> getFilePath() {
        return filePath;
    }

    public void setFilePath(List<String> filePath) {
        this.filePath = filePath;
    }

    public LocalDateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(LocalDateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public FormStatus getStatus() {
        return status;
    }

    public void setStatus(FormStatus status) {
        this.status = status;
    }

    public Boolean getOwnCar() {
        return ownCar;
    }

    public void setOwnCar(Boolean ownCar) {
        this.ownCar = ownCar;
    }

    public Long getServiceProviderId() {
        return serviceProviderId;
    }

    public void setServiceProviderId(Long serviceProviderId) {
        this.serviceProviderId = serviceProviderId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }
}
