package com.pantry.tracker.inventory;

import com.pantry.tracker.inventory.PurgeService.PurgeResult;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PurgeSchedule {

    private static final Logger log = LoggerFactory.getLogger(PurgeSchedule.class);

    private final PurgeService purgeService;

    public PurgeSchedule(PurgeService purgeService) {
        this.purgeService = purgeService;
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void runDaily() {
        PurgeResult result = purgeService.sweep(Instant.now());
        if (result.itemsPurged() > 0 || result.batchesPurged() > 0) {
            log.info("Auto-purge removed {} items and {} batches", result.itemsPurged(),
                    result.batchesPurged());
        }
    }
}
