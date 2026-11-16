package com.eventico.form.dtos;

public class FormSubmissionEvent {
    private String token;
    private FormDto form;

    public FormSubmissionEvent() {}

    public FormSubmissionEvent(String token, FormDto form) {
        this.token = token;
        this.form = form;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public FormDto getForm() {
        return form;
    }

    public void setForm(FormDto form) {
        this.form = form;
    }
}