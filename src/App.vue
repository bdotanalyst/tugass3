<template>
  <div class="app">

    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="header-left">
          <span class="header-dot"></span>
          <div>
            <h1 class="header-title">Weather Forecast</h1>
            <p class="header-meta">Jakarta · Open-Meteo · temperature_2m · −6.2°, 106.8°</p>
          </div>
        </div>
        <div class="header-actions">
          <button
            v-if="stats"
            class="btn btn-ghost"
            @click="dashboardVisible = !dashboardVisible"
          >
            <span class="btn-icon">{{ dashboardVisible ? '▲' : '▼' }}</span>
            {{ dashboardVisible ? 'Hide' : 'Show' }} Dashboard
          </button>
          <button class="btn btn-primary" @click="fetchWeather" :disabled="loading">
            <span :class="{ spin: loading }" class="btn-icon">↻</span>
            {{ loading ? 'Loading…' : 'Refresh' }}
          </button>
        </div>
      </div>
    </header>

    <main class="main">

      <!-- Error -->
      <div v-if="error" class="alert-error">
        <span>⚠ {{ error }}</span>
        <button @click="fetchWeather" class="btn btn-ghost btn-sm">Retry</button>
      </div>

      <!-- Loading skeleton -->
      <div v-else-if="loading && !stats" class="skeleton-row">
        <div v-for="n in 4" :key="n" class="skeleton-card"></div>
      </div>

      <template v-else-if="stats">

        <!-- Collapsible Dashboard -->
        <Transition name="dashboard">
          <section v-show="dashboardVisible" class="dashboard">
            <div class="stat-grid">
              <div class="stat-card">
                <span class="stat-label">Max Temp</span>
                <span class="stat-value">{{ stats.max.toFixed(1) }}<span class="stat-unit">°C</span></span>
                <span class="stat-bar" :style="{ width: statBarWidth(stats.max) }" style="background: #f87171"></span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Min Temp</span>
                <span class="stat-value">{{ stats.min.toFixed(1) }}<span class="stat-unit">°C</span></span>
                <span class="stat-bar" :style="{ width: statBarWidth(stats.min) }" style="background: #93c5fd"></span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Average</span>
                <span class="stat-value">{{ stats.avg }}<span class="stat-unit">°C</span></span>
                <span class="stat-bar" :style="{ width: statBarWidth(parseFloat(stats.avg)) }" style="background: #6ee7b7"></span>
              </div>
              <div class="stat-card">
                <span class="stat-label">Data Points</span>
                <span class="stat-value">{{ stats.total }}<span class="stat-unit"> hrs</span></span>
                <span class="stat-bar" style="width: 100%; background: var(--border)"></span>
              </div>
            </div>
          </section>
        </Transition>

        <!-- Filters -->
        <section class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Date</label>
            <select class="filter-select" v-model="filterDate">
              <option value="">All dates</option>
              <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Time</label>
            <select class="filter-select" v-model="filterHour">
              <option value="">All hours</option>
              <option v-for="h in availableHours" :key="h" :value="h">{{ h }}:00</option>
            </select>
          </div>
          <button
            v-if="filterDate || filterHour"
            class="btn btn-ghost btn-sm clear-btn"
            @click="clearFilters"
          >
            × Clear
          </button>
          <span class="filter-result-count">{{ filteredEntries.length }} rows</span>
        </section>

        <!-- Table -->
        <section class="table-section">
          <WeatherTable :entries="filteredEntries" :per-page="16" />
        </section>

      </template>

      <div v-else class="empty-state">
        <span>Loading data from API…</span>
      </div>

    </main>

    <footer class="footer">
      Data source: <a href="https://open-meteo.com" target="_blank" rel="noopener">open-meteo.com</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useWeather } from './composables/useWeather.js'
import WeatherTable from './components/WeatherTable.vue'

const { entries, byDay, days, stats, loading, error, fetchWeather } = useWeather()

// Dashboard visibility
const dashboardVisible = ref(true)

// Filters
const filterDate = ref('')
const filterHour = ref('')

// Auto-select first day when data loads, but don't force — use as filter default
watch(days, (newDays) => {
  if (newDays.length && !filterDate.value) {
    filterDate.value = newDays[0]
  }
})

const availableHours = computed(() => {
  const hours = new Set()
  for (const e of entries.value) {
    hours.add(e.time.slice(11, 13))
  }
  return [...hours].sort()
})

const filteredEntries = computed(() => {
  return entries.value.filter(e => {
    const matchDate = !filterDate.value || e.time.startsWith(filterDate.value)
    const matchHour = !filterHour.value || e.time.slice(11, 13) === filterHour.value
    return matchDate && matchHour
  })
})

function clearFilters() {
  filterDate.value = ''
  filterHour.value = ''
}

function statBarWidth(val) {
  // Normalize to 0–100 range assuming 0–45°C
  const pct = Math.min(100, Math.max(0, (val / 45) * 100))
  return pct + '%'
}

onMounted(fetchWeather)
</script>

<style>
/* ── Global reset & tokens ──────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:             #0f1117;
  --surface:        #14171f;
  --surface-2:      #1a1e28;
  --hover:          #1e2230;
  --border:         #252a38;
  --border-subtle:  #1d2130;
  --text:           #e2e6f0;
  --text-secondary: #9ba3b8;
  --text-muted:     #5c6478;
  --accent:         #4f8ef7;
  --accent-dim:     rgba(79,142,247,0.08);
  --radius:         6px;
  --font-mono:      'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
  --font-sans:      'DM Sans', 'Geist', system-ui, sans-serif;
}

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button { font-family: inherit; }
select { font-family: inherit; }
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ──────────────────────────────────── */
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  box-shadow: 0 0 6px var(--accent);
}

h1.header-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}

.header-meta {
  font-size: 0.68rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  margin-top: 1px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ── Buttons ─────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-family: var(--font-mono);
  padding: 0.42rem 0.9rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
  font-weight: 500;
  background: transparent;
  color: var(--text-secondary);
}

.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-ghost { background: transparent; }
.btn-ghost:hover:not(:disabled) { border-color: var(--text-secondary); color: var(--text); }

.btn-primary {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}
.btn-primary:hover:not(:disabled) {
  background: rgba(79,142,247,0.14);
}

.btn-sm { padding: 0.28rem 0.65rem; font-size: 0.72rem; }

.btn-icon { font-size: 0.85em; line-height: 1; }
.spin { display: inline-block; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Main ────────────────────────────────────── */
.main {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 1.25rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Dashboard ───────────────────────────────── */
.dashboard {
  overflow: hidden;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}

@media (max-width: 640px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.85rem 1rem 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
  overflow: hidden;
}

.stat-label {
  font-size: 0.65rem;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.03em;
  line-height: 1;
  font-family: var(--font-mono);
  margin-top: 0.1rem;
}

.stat-unit {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 400;
  letter-spacing: 0;
}

.stat-bar {
  display: block;
  height: 2px;
  border-radius: 2px;
  margin-top: 0.5rem;
  opacity: 0.5;
  transition: width 0.6s ease;
}

/* Dashboard transition */
.dashboard-enter-active,
.dashboard-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease, max-height 0.25s ease;
  max-height: 200px;
}
.dashboard-enter-from,
.dashboard-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}

/* ── Filters ─────────────────────────────────── */
.filters-row {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.filter-label {
  font-size: 0.62rem;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.filter-select {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-family: var(--font-mono);
  padding: 0.38rem 0.65rem;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.12s;
  min-width: 130px;
}
.filter-select:focus { border-color: var(--accent); color: var(--text); }

.clear-btn {
  align-self: flex-end;
  border-color: transparent;
  color: var(--text-muted);
}
.clear-btn:hover { color: var(--text-secondary) !important; border-color: var(--border) !important; }

.filter-result-count {
  margin-left: auto;
  font-size: 0.7rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  align-self: flex-end;
  padding-bottom: 0.38rem;
}

/* ── Table section ───────────────────────────── */
.table-section {
  flex: 1;
}

/* ── Alert / Error ───────────────────────────── */
.alert-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(248,113,113,0.25);
  background: rgba(248,113,113,0.05);
  border-radius: var(--radius);
  font-size: 0.82rem;
  color: #f87171;
  font-family: var(--font-mono);
}

/* ── Skeleton ────────────────────────────────── */
.skeleton-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}
.skeleton-card {
  height: 80px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* ── Empty ───────────────────────────────────── */
.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 4rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

/* ── Footer ──────────────────────────────────── */
.footer {
  text-align: center;
  padding: 0.75rem 1.5rem;
  font-size: 0.68rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  border-top: 1px solid var(--border);
}
.footer a {
  color: var(--accent);
  text-decoration: none;
}
.footer a:hover { text-decoration: underline; }
</style>
