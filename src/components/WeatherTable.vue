<template>
  <div class="table-wrap">
    <table class="weather-table">
      <thead>
        <tr>
          <th class="col-date">Date</th>
          <th class="col-time">Time</th>
          <th class="col-temp">Temp (°C)</th>
          <th class="col-cond hide-mobile">Condition</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginated" :key="row.time" class="data-row">
          <td class="cell-mono">{{ formatDate(row.time) }}</td>
          <td class="cell-mono cell-time">{{ formatTime(row.time) }}</td>
          <td>
            <span :class="['temp-badge', tempClass(row.temperature_2m)]">
              {{ row.temperature_2m != null ? row.temperature_2m.toFixed(1) : '—' }}°
            </span>
          </td>
          <td class="hide-mobile cell-cond">{{ tempIcon(row.temperature_2m) }} {{ tempLabel(row.temperature_2m) }}</td>
        </tr>
        <tr v-if="!paginated.length">
          <td colspan="4" class="empty-row">No data for selected filters</td>
        </tr>
      </tbody>
    </table>

    <div class="table-footer">
      <span class="row-count">{{ entries.length }} entries</span>
      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="page === 1" @click="page--" class="pg-btn">← Prev</button>
        <span class="pg-info">{{ page }} / {{ totalPages }}</span>
        <button :disabled="page === totalPages" @click="page++" class="pg-btn">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  perPage: {
    type: Number,
    default: 16
  }
})

const page = ref(1)
watch(() => props.entries, () => { page.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(props.entries.length / props.perPage)))

const paginated = computed(() => {
  const start = (page.value - 1) * props.perPage
  return props.entries.slice(start, start + props.perPage)
})

function formatDate(isoString) {
  const d = new Date(isoString.replace('T', ' '))
  return d.toLocaleDateString('en-CA') // YYYY-MM-DD
}

function formatTime(isoString) {
  return isoString.slice(11, 16) // HH:MM
}

function tempClass(t) {
  if (t == null) return ''
  if (t < 20) return 'temp-cold'
  if (t < 28) return 'temp-normal'
  if (t < 33) return 'temp-warm'
  return 'temp-hot'
}

function tempIcon(t) {
  if (t == null) return '—'
  if (t < 20) return '❄'
  if (t < 28) return '🌤'
  if (t < 33) return '☀'
  return '🔥'
}

function tempLabel(t) {
  if (t == null) return '—'
  if (t < 20) return 'Cold'
  if (t < 28) return 'Normal'
  if (t < 33) return 'Warm'
  return 'Hot'
}
</script>

<style scoped>
.table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
}

.weather-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.825rem;
}

.weather-table th {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.6rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
  font-weight: 500;
  white-space: nowrap;
}

.weather-table td {
  padding: 0.48rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
  color: var(--text);
}

.weather-table tr:last-child td { border-bottom: none; }

.data-row:hover td { background: var(--hover); }

.cell-mono {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cell-time {
  color: var(--text-muted);
}

.cell-cond {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.temp-badge {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.82rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  display: inline-block;
  letter-spacing: 0.02em;
}

.temp-cold   { color: #93c5fd; background: rgba(96,165,250,0.08); }
.temp-normal { color: #6ee7b7; background: rgba(52,211,153,0.08); }
.temp-warm   { color: #fbbf24; background: rgba(251,191,36,0.08); }
.temp-hot    { color: #f87171; background: rgba(248,113,113,0.08); }

.empty-row {
  text-align: center;
  color: var(--text-muted);
  padding: 2.5rem 1rem !important;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

/* Footer row */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 1rem;
  border-top: 1px solid var(--border);
  background: var(--surface-2);
  gap: 1rem;
}

.row-count {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pg-btn {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 0.28rem 0.7rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.12s;
}
.pg-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.pg-info {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  min-width: 40px;
  text-align: center;
}

@media (max-width: 600px) {
  .hide-mobile { display: none; }
  .weather-table th,
  .weather-table td { padding: 0.45rem 0.75rem; }
}
</style>
