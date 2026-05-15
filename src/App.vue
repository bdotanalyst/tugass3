<script setup>
import { onMounted } from 'vue'
import WeatherTable from './components/WeatherTable.vue'
import { useWeather } from './composables/useWeather'

const { entries, stats, loading, error, fetchWeather } = useWeather()

onMounted(() => {
  fetchWeather()
})
</script>

<template>
  <main class="container">
    <h1>Weather Dashboard</h1>

    <div v-if="loading">Loading weather data...</div>
    <div v-else-if="error">{{ error }}</div>

    <template v-else>
      <div class="stats" v-if="stats">
        <div class="card">
          <span>Min</span>
          <strong>{{ stats.min }}°C</strong>
        </div>
        <div class="card">
          <span>Max</span>
          <strong>{{ stats.max }}°C</strong>
        </div>
        <div class="card">
          <span>Average</span>
          <strong>{{ stats.avg }}°C</strong>
        </div>
      </div>

      <WeatherTable :entries="entries" />
    </template>
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}

.container {
  max-width: 1000px;
  margin: auto;
  padding: 32px;
}

.stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  min-width: 120px;
}
</style>
