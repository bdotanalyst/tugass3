<template>
  <div class="table-wrap">
    <table class="weather-table">
      <thead>
        <tr>
          <th>Jam</th>
          <th>Suhu (°C)</th>
          <th class="hide-mobile">Kondisi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginated" :key="row.time">
          <td class="mono">{{ formatTime(row.time) }}</td>
          <td>
            <span :class="['temp-badge', tempClass(row.temperature_2m)]">
              {{ row.temperature_2m != null ? row.temperature_2m.toFixed(1) : '—' }}°
            </span>
          </td>
          <td class="hide-mobile">{{ tempIcon(row.temperature_2m) }}</td>
        </tr>
        <tr v-if="!paginated.length">
          <td colspan="3" style="text-align:center; color: var(--text-muted); padding: 2rem">
            Tidak ada data
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page === 1" @click="page--" class="pg-btn">‹ Prev</button>
      <span class="pg-info">{{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="page++" class="pg-btn">Next ›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormat } from '../composables/useFormat.js'

const { formatTime, tempClass, tempIcon } = useFormat()

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  perPage: {
    type: Number,
    default: 12
  }
})

const page = ref(1)

// Reset to page 1 when entries change (day filter)
watch(() => props.entries, () => { page.value = 1 })

const totalPages = computed(() => Math.ceil(props.entries.length / props.perPage))

const paginated = computed(() => {
  const start = (page.value - 1) * props.perPage
  return props.entries.slice(start, start + props.perPage)
})
</script>

<style scoped>
.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
}
.weather-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.weather-table th {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.85rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}
.weather-table td {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.weather-table tr:last-child td {
  border-bottom: none;
}
.weather-table tr:hover td {
  background: var(--surface-2);
}
.mono {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
}
.temp-badge {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  display: inline-block;
}
.temp-cold  { color: #93c5fd; background: rgba(96,165,250,0.1); }
.temp-normal{ color: #6ee7b7; background: rgba(52,211,153,0.1); }
.temp-warm  { color: #fbbf24; background: rgba(251,191,36,0.1); }
.temp-hot   { color: #f87171; background: rgba(248,113,113,0.1); }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.85rem;
  border-top: 1px solid var(--border);
}
.pg-btn {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s;
}
.pg-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.pg-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.pg-info {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

@media (max-width: 600px) {
  .hide-mobile { display: none; }
  .weather-table th,
  .weather-table td { padding: 0.65rem 1rem; }
}
</style>
