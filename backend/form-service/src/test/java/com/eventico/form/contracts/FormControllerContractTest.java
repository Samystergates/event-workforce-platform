package com.eventico.form.contracts;

import com.eventico.form.controllers.FormController;
import com.eventico.form.services.FormService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = FormController.class)
class FormControllerContractTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FormService formService;

    @Test
    void validateEndpointReturnsContractShape() throws Exception {
        given(formService.validateFilledReviewForm(anyString())).willReturn(true);

        mockMvc.perform(get("/api/form/validate/test-token").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.isValid").value(true));
    }
}
