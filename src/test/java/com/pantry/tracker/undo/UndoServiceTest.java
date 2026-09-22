package com.pantry.tracker.undo;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class UndoServiceTest {

    private UndoEntry.DeleteItem entry(long id, String label) {
        return new UndoEntry.DeleteItem(id, label);
    }

    @Test
    void popsInLastInFirstOutOrder() {
        UndoService service = new UndoService();
        service.push(entry(1L, "a"));
        service.push(entry(2L, "b"));
        service.push(entry(3L, "c"));

        assertThat(service.peekLabel()).contains("c");
        assertThat(service.pop()).get().extracting(UndoEntry::label).isEqualTo("c");
        assertThat(service.pop()).get().extracting(UndoEntry::label).isEqualTo("b");
        assertThat(service.pop()).get().extracting(UndoEntry::label).isEqualTo("a");
        assertThat(service.isEmpty()).isTrue();
        assertThat(service.pop()).isEmpty();
    }

    @Test
    void emptyStackReportsNoLabel() {
        UndoService service = new UndoService();

        assertThat(service.isEmpty()).isTrue();
        assertThat(service.peekLabel()).isEmpty();
    }
}
