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
