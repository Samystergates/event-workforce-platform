package com.eventico.form.repositories;

import com.eventico.form.entities.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormRepo extends JpaRepository<Form, Long> {

    Form findByJobIdAndServiceProviderId(Long jobId, Long serviceProviderId);
}
