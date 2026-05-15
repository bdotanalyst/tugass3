<template>
  <div class="table-container">
    <div class="table-wrapper">
      <table class="weather-table">
        <thead>
          <tr>
            <th>Jam</th>
            <th>Suhu</th>
            <th class="hide-mobile">Kondisi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedData" :key="row.time">
            <td class="time-col">{{ formatHour(row.time) }}</td>
            <td>
              <span :class="['temp-badge', getTempClass(row.temperature_2m)]">
                {{ formatTemp(row.temperature_2m) }}°
              </span>
            </td>
            <td class="hide-mobile">{{ getTempLabel(row.temperature_2m) }}</td>
          </tr>
          <tr v-if="paginatedData.length === 0">
            <td colspan="3" class="empty-row">
              Tidak ada data untuk filter ini
            </td>
          </tr>
        </tbody>
       </table>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
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
    default: 12
  }
})

const currentPage = ref(1)

watch(() => props.entries, () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.ceil(props.entries.length / props.perPage))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.perPage
  return props.entries.slice(start, start + props.perPage)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const formatHour = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatTemp = (temp) => {
  if (temp === null || temp === undefined) return '—'
  return temp.toFixed(1)
}

const getTempClass = (temp) => {
  if (temp === null) return ''
  if (temp < 22) return 'temp-cool'
  if (temp < 26) return 'temp-mild'
  if (temp < 30) return 'temp-warm'
  return 'temp-hot'
}

const getTempLabel = (temp) => {
  if (temp === null) return ''
  if (temp < 22) return 'Sejuk'
  if (temp < 26) return 'Sedang'
  if (temp < 30) return 'Hangat'
  return 'Panas'
}
</script>

<style scoped>
.table-container {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.weather-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.weather-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.weather-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-light);
}

.weather-table tr:last-child td {
  border-bottom: none;
}

.weather-table tbody tr:hover td {
  background: var(--surface-hover);
}

.time-col {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.temp-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 600;
}

.temp-cool {
  color: #6b8c5c;
  background: rgba(107, 140, 92, 0.1);
}

.temp-mild {
  color: #8baa6e;
  background: rgba(139, 170, 110, 0.1);
}

.temp-warm {
  color: #c9a03d;
  background: rgba(201, 160, 61, 0.1);
}

.temp-hot {
  color: #c95454;
  background: rgba(201, 84, 84, 0.1);
}

.empty-row {
  text-align: center;
  padding: 2rem !important;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-top: 1px solid var(--border);
}

.page-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .hide-mobile {
    display: none;
  }
  
  .weather-table th,
  .weather-table td {
    padding: 0.625rem 0.875rem;
  }
}
</style>
