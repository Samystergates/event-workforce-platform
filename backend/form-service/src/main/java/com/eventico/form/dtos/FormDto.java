package com.eventico.form.dtos;

import com.eventico.form.utils.FormStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class FormDto {

    @JsonIgnore
    private int id;

    private Double kilometer;

    @JsonProperty("extra_cost")
    private Double extraCost;

    @JsonProperty("extra_cost_description")
    private String extraCostDescription;

    @JsonIgnore
    List<MultipartFile> files;

    @JsonIgnore
    private LocalDate jobDate;

    @JsonProperty("break_minutes")
    private LocalTime breakMinutes;

    @JsonProperty("end_time")
    private LocalTime endTime;

    @JsonProperty("start_time")
    private LocalTime startTime;

    @JsonProperty("created_date")
    private LocalDateTime createdDate;

    private FormStatus status;

    @JsonProperty("own_car")
    private Boolean ownCar;

    @JsonProperty("service_provider")
    private ServiceProviderDto serviceProvider;

    public ServiceProviderDto getServiceProvider() {
        return serviceProvider;
    }

    public void setServiceProvider(ServiceProviderDto serviceProvider) {
        this.serviceProvider = serviceProvider;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public List<MultipartFile> getFiles() {
        return files;
    }

    public void setFiles(List<MultipartFile> files) {
        this.files = files;
    }

    public LocalDate getJobDate() {
        return jobDate;
    }

    public void setJobDate(LocalDate jobDate) {
        this.jobDate = jobDate;
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

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
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
}
