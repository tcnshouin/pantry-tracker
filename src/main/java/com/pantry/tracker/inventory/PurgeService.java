package com.pantry.tracker.inventory;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PurgeService {

    private final ItemRepository itemRepository;
    private final BatchRepository batchRepository;

    public PurgeService(ItemRepository itemRepository, BatchRepository batchRepository) {
        this.itemRepository = itemRepository;
        this.batchRepository = batchRepository;
    }

    public record PurgeResult(int itemsPurged, int batchesPurged) {
    }

    @Transactional
    public PurgeResult sweep(Instant now) {
        Instant itemCutoff = now.minus(Duration.ofDays(PurgeCalculator.ITEM_PURGE_DAYS));
        List<Item> emptyItems = itemRepository.findByPurgeOverrideFalseAndEmptySinceBefore(itemCutoff);
        int itemsPurged = 0;
        for (Item item : emptyItems) {
            if (item.totalQuantity() == 0) {
                itemRepository.delete(item);
                itemsPurged++;
            }
        }
        itemRepository.flush();

        Instant batchCutoff = now.minus(Duration.ofDays(PurgeCalculator.BATCH_PURGE_DAYS));
        List<Batch> emptyBatches = batchRepository.findByPurgeOverrideFalseAndEmptySinceBefore(batchCutoff);
        int batchesPurged = 0;
        for (Batch batch : emptyBatches) {
            if (batch.getQuantity() == 0 && !batch.getItem().isPurgeOverride()) {
                batchRepository.delete(batch);
                batchesPurged++;
            }
        }
        return new PurgeResult(itemsPurged, batchesPurged);
    }
}
