# Full App.vue

```vue
<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-inner">
        <div class="topbar-left">
          <div class="status-dot"></div>

          <div>
            <h1 class="page-title">
              Weather Operations
            </h1>

            <p class="page-meta">
              Jakarta · Open-Meteo · temperature_2m · −6.2°, 106.8°
            </p>
          </div>
        </div>

        <div class="topbar-actions">
          <button
            class="btn btn-ghost"
            @click="showDashboard = !showDashboard"
          >
            {{ showDashboard ? 'Hide Dashboard' : 'Show Dashboard' }}
          </button>

          <button
            class="btn btn-primary"
            @click="fetchWeather"
            :disabled="loading"
          >
            <span
              class="refresh-icon"
              :class="{ spinning: loading }"
            >
              ↻
            </span>

            {{ loading ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>
    </header>

    <main class="content-wrapper">
      <div
        v-if="error"
        class="error-banner"
      >
        <span>{{ error }}</span>

        <button
          class="btn btn-ghost btn-small"
          @click="fetchWeather"
        >
          Retry
        </button>
      </div>

      <section
        v-if="showDashboard && dailyStats"
        class="metrics-grid"
      >
        <div class="metric-card">
          <span class="metric-label">
            Selected Date
          </span>

          <span class="metric-value metric-date">
            {{ formattedDate }}
          </span>
        </div>

        <div class="metric-card">
          <span class="metric-label">
            Average
          </span>

          <span class="metric-value">
            {{ dailyStats.avg }}°C
          </span>

          <span class="metric-bar metric-bar-neutral"></span>
        </div>

        <div class="metric-card">
          <span class="metric-label">
            Minimum
          </span>

          <span class="metric-value">
            {{ dailyStats.min }}°C
          </span>

          <span class="metric-bar metric-bar-cold"></span>
        </div>

        <div class="metric-card">
          <span class="metric-label">
            Maximum
          </span>

          <span class="metric-value">
            {{ dailyStats.max }}°C
          </span>

          <span class="metric-bar metric-bar-hot"></span>
        </div>
      </section>

      <section class="control-panel">
        <div class="date-slider-wrapper">
          <div class="date-slider">
            <button
              v-for="day in days"
              :key="day"
              class="date-chip"
              :class="{
                active: selectedDay === day
              }"
              @click="selectedDay = day"
            >
              <span class="date-chip-day">
                {{ new Date(day).toLocaleDateString('id-ID', {
                  weekday: 'short'
                }) }}
              </span>

              <span class="date-chip-date">
                {{ new Date(day).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short'
                }) }}
              </span>
            </button>
          </div>
        </div>

        <div class="filter-toolbar">
          <div class="filter-group">
            <label class="filter-label">
              Filter Hour
            </label>

            <select
              v-model="selectedHour"
              class="filter-select"
            >
              <option value="all">
                All Hours
              </option>

              <option
                v-for="hour in 24"
                :key="hour"
                :value="hour - 1"
              >
                {{ String(hour - 1).padStart(2, '0') }}:00
              </option>
            </select>
          </div>

          <div class="table-meta">
            {{ currentEntries.length }} rows
          </div>
        </div>
      </section>

      <section class="table-wrapper">
        <WeatherTable
          :rows="currentEntries"
          :loading="loading"
          :error="error"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import WeatherTable from './WeatherTable.vue'
import { useWeather } from './useWeather'

const {
  byDay,
  days,
  loading,
  error,
  fetchWeather
} = useWeather()

const selectedDay = ref('')
const selectedHour = ref('all')
const showDashboard = ref(true)

onMounted(async () => {
  await fetchWeather()

  if (days.value.length) {
    selectedDay.value = days.value[0]
  }
})

const currentEntries = computed(() => {
  const items = byDay.value[selectedDay.value] || []

  if (selectedHour.value === 'all') {
    return items
  }

  return items.filter(entry => {
    const hour = new Date(entry.time).getHours()

    return hour === Number(selectedHour.value)
  })
})

const dailyStats = computed(() => {
  const temps = currentEntries.value.map(item => item.temperature_2m)

  if (!temps.length) {
    return null
  }

  return {
    min: Math.min(...temps).toFixed(1),
    max: Math.max(...temps).toFixed(1),
    avg: (
      temps.reduce((a, b) => a + b, 0) / temps.length
    ).toFixed(1)
  }
})

const formattedDate = computed(() => {
  if (!selectedDay.value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date(selectedDay.value))
})
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  background: #0f1115;
  color: #f4f4f5;
  font-family: Inter, sans-serif;
}

.app-shell {
  min-height: 100vh;
  background: #0f1115;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(10px);
  background: rgba(15, 17, 21, 0.88);
  border-bottom: 1px solid #23262f;
}

.topbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #60a5fa;
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.7);
}

.page-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.page-meta {
  margin-top: 3px;
  font-size: 12px;
  color: #71717a;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #2c313c;
  background: transparent;
  color: #d4d4d8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.16s ease;
}

.btn:hover {
  border-color: #3f4654;
  background: #181b22;
}

.btn-primary {
  background: #181f2d;
  border-color: #2d3f63;
  color: #93c5fd;
}

.btn-primary:hover {
  background: #1d2534;
}

.btn-small {
  height: 30px;
  padding: 0 12px;
  font-size: 12px;
}

.refresh-icon {
  display: inline-block;
  margin-right: 6px;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.25);
  background: rgba(248, 113, 113, 0.08);
  color: #fca5a5;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid #23262f;
  background: #151821;
}

.metric-label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #71717a;
}

.metric-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.04em;
}

.metric-date {
  font-size: 15px;
  line-height: 1.5;
}

.metric-bar {
  display: block;
  width: 100%;
  height: 2px;
  margin-top: 18px;
  border-radius: 999px;
}

.metric-bar-hot {
  background: #f59e0b;
}

.metric-bar-cold {
  background: #38bdf8;
}

.metric-bar-neutral {
  background: #34d399;
}

.control-panel {
  border: 1px solid #23262f;
  background: #151821;
  border-radius: 16px;
  overflow: hidden;
}

.date-slider-wrapper {
  border-bottom: 1px solid #23262f;
  overflow-x: auto;
}

.date-slider {
  display: flex;
  gap: 10px;
  padding: 14px;
  min-width: max-content;
}

.date-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 110px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #262b36;
  background: #11141b;
  color: #a1a1aa;
  cursor: pointer;
  transition: 0.16s ease;
}

.date-chip:hover {
  border-color: #3b4250;
  color: #fafafa;
}

.date-chip.active {
  background: #f4f4f5;
  color: #111111;
  border-color: #f4f4f5;
}

.date-chip-day {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.date-chip-date {
  font-size: 14px;
  font-weight: 600;
}

.filter-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #71717a;
}

.filter-select {
  min-width: 180px;
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #2b313d;
  background: #11141b;
  color: #fafafa;
  outline: none;
}

.filter-select:focus {
  border-color: #52525b;
}

.table-meta {
  font-size: 12px;
  color: #71717a;
}

.table-wrapper {
  border-radius: 16px;
  border: 1px solid #23262f;
  overflow: hidden;
}

@media (max-width: 900px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .topbar-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    width: 100%;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

# Full WeatherTable.vue

```vue
<template>
  <div class="weather-table-shell">
    <table class="weather-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Temperature</th>
          <th>Status</th>
          <th>Condition</th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="loading">
          <td colspan="4" class="table-empty">
            Loading weather data...
          </td>
        </tr>

        <tr v-else-if="error">
          <td colspan="4" class="table-error">
            {{ error }}
          </td>
        </tr>

        <tr v-else-if="!rows.length">
          <td colspan="4" class="table-empty">
            No weather data available.
          </td>
        </tr>

        <tr
          v-for="item in rows"
          :key="item.time"
          class="table-row"
        >
          <td class="time-cell">
            <div class="time-primary">
              {{ formatHour(item.time) }}
            </div>

            <div class="time-secondary">
              {{ formatDate(item.time) }}
            </div>
          </td>

          <td>
            <div class="temp-cell">
              {{ item.temperature_2m.toFixed(1) }}°C
            </div>
          </td>

          <td>
            <div
              class="status-badge"
              :class="statusClass(item.temperature_2m)"
            >
              {{ statusLabel(item.temperature_2m) }}
            </div>
          </td>

          <td>
            <div class="condition-bar-wrapper">
              <div
                class="condition-bar"
                :style="{
                  width: normalizeTemp(item.temperature_2m)
                }"
              ></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  rows: {
    type: Array,
    default: () => []
  },

  loading: {
    type: Boolean,
    default: false
  },

  error: {
    type: String,
    default: ''
  }
})

function formatHour(value) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short'
  }).format(new Date(value))
}

function statusLabel(temp) {
  if (temp >= 30) return 'Hot'
  if (temp <= 24) return 'Cool'
  return 'Normal'
}

function statusClass(temp) {
  if (temp >= 30) return 'status-hot'
  if (temp <= 24) return 'status-cool'
  return 'status-normal'
}

function normalizeTemp(temp) {
  const percentage = Math.min(
    100,
    Math.max(0, (temp / 45) * 100)
  )

  return `${percentage}%`
}
</script>

<style scoped>
.weather-table-shell {
  overflow-x: auto;
  background: #12151d;
}

.weather-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

.weather-table thead {
  background: #171b24;
}

.weather-table th {
  padding: 14px 18px;
  border-bottom: 1px solid #23262f;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #71717a;
}

.weather-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #20232c;
  font-size: 14px;
  color: #e4e4e7;
}

.table-row {
  transition: background 0.14s ease;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.025);
}

.time-primary {
  font-size: 14px;
  font-weight: 600;
}

.time-secondary {
  margin-top: 3px;
  font-size: 12px;
  color: #71717a;
}

.temp-cell {
  font-size: 15px;
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-hot {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.18);
}

.status-cool {
  background: rgba(56, 189, 248, 0.12);
  color: #7dd3fc;
  border-color: rgba(56, 189, 248, 0.18);
}

.status-normal {
  background: rgba(113, 113, 122, 0.12);
  color: #d4d4d8;
  border-color: rgba(113, 113, 122, 0.18);
}

.condition-bar-wrapper {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: #1d212c;
}

.condition-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    #38bdf8,
    #34d399,
    #f59e0b
  );
}

.table-empty,
.table-error {
  padding: 48px 20px !important;
  text-align: center;
  font-size: 13px;
}

.table-empty {
  color: #71717a;
}

.table-error {
  color: #fca5a5;
}
</style>
```

Perubahan utama:

* Tanggal dipisah jadi horizontal date switcher.
* Jam dipindah jadi filter dropdown.
* Dashboard metrics bisa di-hide.
* Table dibuat lebih compact dan operational.
* Struktur visual lebih tenang dan mudah discan.
* Fokus utama tetap ke data table, bukan dekorasi.
