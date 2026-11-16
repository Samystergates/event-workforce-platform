package com.eventico.finance.configurations;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "msgraph")
public class MsGraphProperties {

    private boolean enabled = false;

    private String clientId;
    private String clientSecret;
    private String tenantId;
    private long requestDelayMs = 500;
    private int maxEmailsPerPoll = 50;
    private String primaryMailbox;
}