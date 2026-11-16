package com.rentmen.app.DTO;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class UserDtoSerializationTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void pinCanBeDeserializedForRequestsButIsNeverSerialized() throws Exception {
        UserDto request = objectMapper.readValue("{\"pin\":\"1234\"}", UserDto.class);
        assertEquals("1234", request.getPin());

        String response = objectMapper.writeValueAsString(request);
        assertFalse(response.contains("1234"));
        assertFalse(response.contains("\"pin\""));
    }
}
