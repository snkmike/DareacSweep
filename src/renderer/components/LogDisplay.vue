<template>
  <div class="log-display">
    <h2>Logs</h2>
    <ul>
      <li v-for="log in logs" :key="log">{{ log }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    logs: Array
  }
};
</script>

<style scoped>
.log-display {
  margin-top: 20px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  background: #f5f5f5;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
}
</style>
