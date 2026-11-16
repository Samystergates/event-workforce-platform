package com.eventico.finance.contracts;

import com.eventico.finance.controllers.InvoiceController;
import com.eventico.finance.configurations.SecurityConfig;
import com.eventico.finance.dtos.InvoiceSummaryDto;
import com.eventico.finance.services.InvoiceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = InvoiceController.class)
@Import(SecurityConfig.class)
class InvoiceControllerContractTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InvoiceService invoiceService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @Test
    @WithMockUser(authorities = "SCOPE_finance")
    void listInvoicesReturnsExpectedContractShape() throws Exception {
        InvoiceSummaryDto dto = new InvoiceSummaryDto(
                1L,
                "INV-001",
                LocalDate.of(2026, 1, 1),
                "Supplier A",
                new BigDecimal("100.00"),
                true,
                false,
                0.95,
                "OCR",
                "Inbox",
                "invoice.pdf",
                OffsetDateTime.now()
        );
        given(invoiceService.listInvoices(null, null, null)).willReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/invoices").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].invoiceNumber").value("INV-001"))
                .andExpect(jsonPath("$[0].supplierName").value("Supplier A"));
    }

    @Test
    @WithMockUser
    void listInvoicesRejectsUsersWithoutFinanceScope() throws Exception {
        mockMvc.perform(get("/api/v1/invoices"))
                .andExpect(status().isForbidden());
    }

    @Test
    void listInvoicesRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/invoices"))
                .andExpect(status().isUnauthorized());
    }
}
