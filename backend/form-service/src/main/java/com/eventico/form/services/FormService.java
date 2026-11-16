package com.eventico.form.services;

import com.eventico.form.dtos.FormDto;
import com.eventico.form.entities.Form;

import java.util.List;

public interface FormService {

    void saveNewForm(Form form);
    void postReviewFormServiceProvider(String token, FormDto formDto);

    Boolean validateFilledReviewForm(String token);

    Boolean validateFilledReviewFormByValues(Long jobId, Long serviceProviderId);

    List<String> getFilePaths(Long jobId, Long serviceProviderId);

}
