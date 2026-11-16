package com.eventico.finance.services.mails;

import com.azure.core.credential.TokenRequestContext;
import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.eventico.finance.configurations.MsGraphProperties;
import com.microsoft.graph.authentication.IAuthenticationProvider;
import com.microsoft.graph.requests.GraphServiceClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Component
@ConditionalOnProperty(prefix = "msgraph", name = "enabled", havingValue = "true")
public class MicrosoftGraphClientProvider {

    private static final String GRAPH_SCOPE = "https://graph.microsoft.com/.default";

    private final IAuthenticationProvider authProvider;

    public MicrosoftGraphClientProvider(MsGraphProperties properties) {
        ClientSecretCredential credential = new ClientSecretCredentialBuilder()
                .clientId(properties.getClientId())
                .clientSecret(properties.getClientSecret())
                .tenantId(properties.getTenantId())
                .build();

        this.authProvider = new IAuthenticationProvider() {
            private final TokenRequestContext context =
                    new TokenRequestContext().setScopes(List.of(GRAPH_SCOPE));

            @Override
            public CompletableFuture<String> getAuthorizationTokenAsync(URL requestUrl) {
                return credential.getToken(context)
                        .map(token -> token.getToken())
                        .toFuture();
            }
        };
    }

    public GraphServiceClient<?> graphClient() {
        return GraphServiceClient.builder()
                .authenticationProvider(authProvider)
                .buildClient();
    }
}
