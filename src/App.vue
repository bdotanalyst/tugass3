// App.vue
<template>
  <div class="app">
    <header class="header">
      <div class="header-inner">
        <div class="brand">
          <span class="brand-icon">⛅</span>
          <div>
            <h1>Prakiraan Cuaca</h1>
            <p class="brand-sub">Jakarta · Open-Meteo</p>
          </div>
        </div>
        <button class="refresh-btn" @click="fetchWeather" :disabled="loading">
          <span :class="{ spin: loading }">↻</span>
          {{ loading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </header>

    <main class="main">
      <div v-if="error" class="error-box">
        <span>⚠️</span> {{ error }}
        <button @click="fetchWeather" class="retry-btn">Coba lagi</button>
      </div>

      <div v-else-if="loading && !stats" class="loading-skeleton">
        <div class="skeleton-stats">
          <div v-for="n in 4" :key="n" class="skeleton-card"></div>
        </div>
      </div>

      <template v-else-if="stats">
        <!-- Dashboard Header with Collapse -->
        <div class="dashboard-section">
          <div class="dashboard-header" @click="toggleDashboard">
            <div class="dashboard-title">
              <svg class="collapse-icon" :class="{ rotated: isDashboardCollapsed }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <h2>Ringkasan</h2>
            </div>
            <span class="dashboard-badge">{{ stats.total }} data</span>
          </div>
          
          <div v-if="!isDashboardCollapsed" class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Maksimum</span>
              <span class="stat-value">{{ stats.max.toFixed(1) }}<span class="stat-unit">°C</span></span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Minimum</span>
              <span class="stat-value">{{ stats.min.toFixed(1) }}<span class="stat-unit">°C</span></span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Rata-rata</span>
              <span class="stat-value">{{ stats.avg }}<span class="stat-unit">°C</span></span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Rentang</span>
              <span class="stat-value">{{ (stats.max - stats.min).toFixed(1) }}<span class="stat-unit">°C</span></span>
            </div>
          </div>
        </div>

        <!-- Date Slider -->
        <div class="slider-section">
          <div class="section-label">Pilih Tanggal</div>
          <div class="date-slider">
            <button class="slider-arrow" @click="prevDate" :disabled="currentDateIndex === 0">‹</button>
            <div class="slider-track">
              <button
                v-for="(date, idx) in days"
                :key="date"
                class="date-chip"
                :class="{ active: idx === currentDateIndex }"
                @click="selectDate(idx)"
              >
                <span class="date-num">{{ formatDayNum(date) }}</span>
                <span class="date-name">{{ formatDayName(date) }}</span>
              </button>
            </div>
            <button class="slider-arrow" @click="nextDate" :disabled="currentDateIndex === days.length - 1">›</button>
          </div>
        </div>

        <!-- Hour Filter -->
        <div class="filter-section">
          <div class="section-label">Filter Jam</div>
          <div class="hour-filters">
            <button
              v-for="range in hourRanges"
              :key="range.value"
              class="filter-chip"
              :class="{ active: activeHourFilter === range.value }"
              @click="setHourFilter(range.value)"
            >
              {{ range.label }}
            </button>
            <button v-if="activeHourFilter" class="filter-chip clear" @click="clearHourFilter">Hapus</button>
          </div>
        </div>

        <!-- Weather Table -->
        <WeatherTable 
          :entries="filteredEntries" 
          :per-page="12"
        />
      </template>

      <div v-else class="empty-state">
        <p>Memuat data cuaca...</p>
      </div>
    </main>

    <footer class="footer">
      Data dari <a href="https://open-meteo.com" target="_blank">open-meteo.com</a> · Jakarta (-6.2°, 106.8°)
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import WeatherTable from './WeatherTable.vue'

// State
const weatherData = ref(null)
const loading = ref(false)
const error = ref(null)
const isDashboardCollapsed = ref(false)
const currentDateIndex = ref(0)
const activeHourFilter = ref(null)

// Hour ranges
const hourRanges = [
  { label: '00:00 - 06:00', value: 'night', start: 0, end: 6 },
  { label: '06:00 - 12:00', value: 'morning', start: 6, end: 12 },
  { label: '12:00 - 18:00', value: 'afternoon', start: 12, end: 18 },
  { label: '18:00 - 24:00', value: 'evening', start: 18, end: 24 }
]

// Computed
const groupedData = computed(() => weatherData.value?.grouped || {})
const days = computed(() => weatherData.value?.days || [])
const stats = computed(() => weatherData.value?.stats || null)

const currentDate = computed(() => days.value[currentDateIndex.value] || '')
const currentEntries = computed(() => groupedData.value[currentDate.value] || [])

const filteredEntries = computed(() => {
  let entries = currentEntries.value
  
  if (activeHourFilter.value) {
    const range = hourRanges.find(r => r.value === activeHourFilter.value)
    if (range) {
      entries = entries.filter(entry => {
        const hour = new Date(entry.time).getHours()
        return hour >= range.start && hour < range.end
      })
    }
  }
  
  return entries
})

// Methods
const toggleDashboard = () => {
  isDashboardCollapsed.value = !isDashboardCollapsed.value
}

const prevDate = () => {
  if (currentDateIndex.value > 0) currentDateIndex.value--
}

const nextDate = () => {
  if (currentDateIndex.value < days.value.length - 1) currentDateIndex.value++
}

const selectDate = (index) => {
  currentDateIndex.value = index
  activeHourFilter.value = null
}

const setHourFilter = (value) => {
  activeHourFilter.value = activeHourFilter.value === value ? null : value
}

const clearHourFilter = () => {
  activeHourFilter.value = null
}

const formatDayNum = (dateStr) => {
  const date = new Date(dateStr)
  return date.getDate().toString()
}

const formatDayName = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { weekday: 'short' })
}

const fetchWeather = async () => {
  loading.value = true
  error.value = null
  
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m&timezone=Asia/Jakarta&forecast_days=7'
    )
    
    if (!res.ok) throw new Error('Gagal mengambil data')
    
    const data = await res.json()
    const hourly = data.hourly
    const times = hourly.time
    const temps = hourly.temperature_2m
    
    const grouped = {}
    const allTemps = []
    
    times.forEach((time, idx) => {
      const date = time.split('T')[0]
      const temp = temps[idx]
      
      if (!grouped[date]) grouped[date] = []
      grouped[date].push({ time, temperature_2m: temp })
      allTemps.push(temp)
    })
    
    const maxTemp = Math.max(...allTemps)
    const minTemp = Math.min(...allTemps)
    const avgTemp = allTemps.reduce((a, b) => a + b, 0) / allTemps.length
    
    weatherData.value = {
      grouped,
      days: Object.keys(grouped).sort(),
      stats: {
        max: maxTemp,
        min: minTemp,
        avg: avgTemp.toFixed(1),
        total: allTemps.length
      }
    }
    
    currentDateIndex.value = 0
    activeHourFilter.value = null
    
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(days, (newDays) => {
  if (newDays.length && currentDateIndex.value >= newDays.length) {
    currentDateIndex.value = 0
  }
})

onMounted(fetchWeather)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #0a0a0a;
  --bg-secondary: #111111;
  --surface: #1a1a1a;
  --surface-hover: #222222;
  --border: #2a2a2a;
  --border-light: #333333;
  --text: #e5e5e5;
  --text-secondary: #8a8a8a;
  --text-tertiary: #5a5a5a;
  --accent: #3b82f6;
  --accent-dim: rgba(59, 130, 246, 0.1);
  --success: #10b981;
  --radius-sm: 4px;
  --radius: 6px;
  --radius-md: 8px;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Text', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
}

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  border-bottom: 1px solid var(--border);
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand h1 {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.brand-sub {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.15s;
}

.refresh-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Main */
.main {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Error */
.error-box {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  color: #f87171;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.retry-btn {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid #f87171;
  border-radius: var(--radius-sm);
  color: #f87171;
  font-size: 0.75rem;
  cursor: pointer;
}

/* Loading */
.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.skeleton-card {
  height: 80px;
  background: var(--surface);
  border-radius: var(--radius);
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Dashboard */
.dashboard-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
}

.dashboard-header:hover {
  background: var(--surface-hover);
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard-title h2 {
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

.collapse-icon {
  transition: transform 0.2s;
  color: var(--text-tertiary);
}

.collapse-icon.rotated {
  transform: rotate(180deg);
}

.dashboard-badge {
  font-size: 0.65rem;
  padding: 0.125rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
  border-top: 1px solid var(--border);
}

.stat-card {
  background: var(--surface);
  padding: 1rem;
}

.stat-label {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  margin-bottom: 0.5rem;
  font-family: var(--font-mono);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--text);
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--text-tertiary);
  margin-left: 0.125rem;
}

/* Sections */
.slider-section,
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

/* Date Slider */
.date-slider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.5rem;
}

.slider-arrow {
  width: 32px;
  height: 32px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.slider-arrow:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}

.slider-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slider-track {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0.125rem 0;
}

.slider-track::-webkit-scrollbar {
  height: 3px;
}

.slider-track::-webkit-scrollbar-track {
  background: var(--border);
  border-radius: var(--radius-sm);
}

.slider-track::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: var(--radius-sm);
}

.date-chip {
  flex: 0 0 auto;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
  min-width: 70px;
}

.date-chip:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.date-chip.active {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.date-chip.active .date-num {
  color: var(--accent);
}

.date-num {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
}

.date-name {
  display: block;
  font-size: 0.6rem;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

/* Hour Filters */
.hour-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 0.375rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.15s;
}

.filter-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.filter-chip.active {
  border-color: var(--accent);
  background: var(--accent-dim);
  color: var(--accent);
}

.filter-chip.clear {
  border-color: var(--danger);
  color: var(--danger);
}

.filter-chip.clear:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

/* Footer */
.footer {
  text-align: center;
  padding: 1rem;
  font-size: 0.7rem;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  border-top: 1px solid var(--border);
}

.footer a {
  color: var(--accent);
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .date-chip {
    min-width: 55px;
    padding: 0.375rem 0.75rem;
  }
  
  .date-num {
    font-size: 0.8rem;
  }
}
</style>
