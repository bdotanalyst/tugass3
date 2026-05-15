<template>
  <div class="app">

    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="header-title">
          <span class="header-icon">⛅</span>
          <div>
            <h1>Prakiraan Cuaca</h1>
            <p class="header-sub">Jakarta · Open-Meteo API · temperature_2m</p>
          </div>
        </div>
        <button class="refresh-btn" @click="fetchWeather" :disabled="loading">
          <span :class="{ spin: loading }">↻</span>
          {{ loading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </header>

    <main class="main">

      <!-- Error state -->
      <div v-if="error" class="error-box">
        ⚠️ {{ error }}
        <button @click="fetchWeather" class="retry-btn">Coba lagi</button>
      </div>

      <!-- Loading skeleton -->
      <div v-else-if="loading" class="loading-grid">
        <div v-for="n in 4" :key="n" class="skeleton-card"></div>
      </div>

      <!-- Content -->
      <template v-else-if="stats">

        <!-- Stats row -->
        <section class="stats-grid">
          <StatCard label="Suhu Maks" :value="stats.max.toFixed(1)" unit="°C" />
          <StatCard label="Suhu Min" :value="stats.min.toFixed(1)" unit="°C" />
          <StatCard label="Rata-rata" :value="stats.avg" unit="°C" />
          <StatCard label="Total Data" :value="stats.total" unit=" jam" />
        </section>

        <!-- Day filter -->
        <section class="section">
          <p class="section-label">Filter Hari</p>
          <DayFilter :days="days" v-model="selectedDay" />
        </section>

        <!-- Date heading -->
        <section class="section">
          <div class="date-heading">
            <span class="date-text">{{ formatDate(selectedDay) }}</span>
            <span class="date-count">{{ currentEntries.length }} jam data</span>
          </div>
          <WeatherTable :entries="currentEntries" :per-page="12" />
        </section>

      </template>

      <!-- Empty state (initial) -->
      <div v-else class="empty-state">
        <p>Memuat data dari API…</p>
      </div>

    </main>

    <footer class="footer">
      Data dari <a href="https://open-meteo.com" target="_blank" rel="noopener">open-meteo.com</a> · Koordinat Jakarta −6.2°, 106.8°
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeather } from './composables/useWeather.js'
import { useFormat } from './composables/useFormat.js'
import StatCard from './components/StatCard.vue'
import DayFilter from './components/DayFilter.vue'
import WeatherTable from './components/WeatherTable.vue'

const { byDay, days, stats, loading, error, fetchWeather } = useWeather()
const { formatDate } = useFormat()

const selectedDay = ref('')

// Auto-select first day when data arrives
const ensureSelected = () => {
  if (days.value.length && !selectedDay.value) {
    selectedDay.value = days.value[0]
  }
}

const currentEntries = computed(() => {
  if (!selectedDay.value) return []
  return byDay.value[selectedDay.value] || []
})

// Watch days reactively
import { watch } from 'vue'
watch(days, ensureSelected)

onMounted(fetchWeather)
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ─────────────────────────────────── */
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
}
.header-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.header-icon {
  font-size: 2rem;
  line-height: 1;
}
h1 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.2;
}
.header-sub {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  margin-top: 2px;
}
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: var(--accent-dim);
  color: var(--accent);
  cursor: pointer;
  transition: all 0.15s;
}
.refresh-btn:hover:not(:disabled) {
  background: rgba(56,189,248,0.22);
}
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.spin { display: inline-block; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Main ────────────────────────────────────── */
.main {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Stats grid ──────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}
@media (max-width: 600px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ── Section ─────────────────────────────────── */
.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.section-label {
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.date-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.date-text {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--text);
}
.date-count {
  font-size: 0.72rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

/* ── States ──────────────────────────────────── */
.error-box {
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.3);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  color: #f87171;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.retry-btn {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #f87171;
  background: transparent;
  color: #f87171;
  cursor: pointer;
}
.loading-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}
.skeleton-card {
  height: 80px;
  border-radius: var(--radius);
  background: var(--surface-2);
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 3rem;
  font-family: var(--font-mono);
}

/* ── Footer ──────────────────────────────────── */
.footer {
  text-align: center;
  padding: 1rem 1.5rem;
  font-size: 0.72rem;
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
