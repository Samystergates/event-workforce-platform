package com.eventico.finance;

import com.eventico.finance.configurations.AppProperties;
import com.eventico.finance.configurations.DocumentAiProperties;
import com.eventico.finance.configurations.MsGraphProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@EnableConfigurationProperties({AppProperties.class, MsGraphProperties.class, DocumentAiProperties.class})
public class FinanceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinanceApplication.class, args);
	}

}
