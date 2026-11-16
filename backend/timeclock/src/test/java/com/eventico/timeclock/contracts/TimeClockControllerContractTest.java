package com.eventico.timeclock.contracts;

import com.eventico.timeclock.controller.TimeClockController;
import com.eventico.timeclock.services.TimeClockService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TimeClockController.class, properties = {
        "JWT_SIGNING_SECRET=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
        "JWT_AUDIENCE=eventico-test"
})
class TimeClockControllerContractTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TimeClockService timeClockService;

    @Test
    void punchEndpointReturnsSuccessResponseContract() throws Exception {
        given(timeClockService.handleClockEvent(any())).willReturn(true);

        mockMvc        .perform(post("/api/timeclock/punch").with(jwt().authorities(
                        new SimpleGrantedAuthority("SCOPE_timeclock")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"timeClockDto\":{\"pin\":\"1234\",\"action\":\"CLOCK_IN\"}}"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true));
    }
}
