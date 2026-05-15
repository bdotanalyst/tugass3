import { ref, computed } from 'vue'

const API_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m'

export function useWeather() {
  const rawData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const entries = computed(() => {
    if (!rawData.value) return []

    const { time, temperature_2m } = rawData.value.hourly

    return time.map((t, i) => ({
      time: t,
      temperature_2m: temperature_2m[i]
    }))
  })

  const stats = computed(() => {
    const temps = entries.value.map(e => e.temperature_2m)

    if (!temps.length) return null

    return {
      min: Math.min(...temps),
      max: Math.max(...temps),
      avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
    }
  })

  async function fetchWeather() {
    loading.value = true
    error.value = null

    try {
      const res = await fetch(API_URL)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      rawData.value = await res.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    entries,
    stats,
    loading,
    error,
    fetchWeather
  }
}
