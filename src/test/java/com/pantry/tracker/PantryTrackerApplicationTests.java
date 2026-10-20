package com.pantry.tracker;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@EnabledIf("com.pantry.tracker.SupabaseAvailable#configured")
class PantryTrackerApplicationTests {

	@Test
	void contextLoads() {
	}

}
