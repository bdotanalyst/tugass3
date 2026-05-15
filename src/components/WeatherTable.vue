<script setup>
defineProps({
  entries: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Time</th>
        <th>Temperature</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries" :key="entry.time">
        <td>{{ entry.time }}</td>
        <td>{{ entry.temperature_2m }}°C</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

th, td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
</style>
