package com.rentmen.app.utils;

import com.rentmen.app.entities.Client;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UtilFunctionsTest {
    @Test
    void mergesOrdinaryFieldsWithoutAllowingPrivilegedAccountChanges() throws Exception {
        Client existing = new Client();
        existing.setEmail("before@example.test");
        existing.setPassword("stored-hash");
        existing.setDepId(1);
        existing.setActive(true);

        Client incoming = new Client();
        incoming.setEmail("after@example.test");
        incoming.setPassword("attacker-value");
        incoming.setDepId(2);
        incoming.setActive(false);

        UtilFunctions.mergeObjects(existing, incoming);

        assertEquals("after@example.test", existing.getEmail());
        assertEquals("stored-hash", existing.getPassword());
        assertEquals(1, existing.getDepId());
        assertEquals(true, existing.getActive());
    }
}
