package com.eventico.api_gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"JWT_SECURITY_ENABLED=false",
		"JWT_AUDIENCE=eventico-test"
})
class ApiGatewayApplicationTests {

	@Test
	void contextLoads() {
	}

}
