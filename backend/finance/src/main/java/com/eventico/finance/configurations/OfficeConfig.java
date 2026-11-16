package com.eventico.finance.configurations;

import lombok.RequiredArgsConstructor;
import org.jodconverter.core.office.OfficeException;
import org.jodconverter.core.office.OfficeManager;
import org.jodconverter.local.office.LocalOfficeManager;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.nio.file.Path;

@Configuration
@RequiredArgsConstructor
public class OfficeConfig {

    private final AppProperties appProperties;

    @Bean(destroyMethod = "stop")
    @ConditionalOnProperty(prefix = "app", name = "office-home")
    public OfficeManager officeManager() throws OfficeException {
        LocalOfficeManager.Builder builder = LocalOfficeManager.builder()
                .officeHome(appProperties.officeHomePath().map(Path::toFile).orElseThrow());
        OfficeManager manager = builder.build();
        manager.start();
        return manager;
    }
}