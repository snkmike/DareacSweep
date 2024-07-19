<template>
  <div id="app">
    <SetupForm @startSweep="startSweep"/>
    <LogDisplay :logs="logs"/>
  </div>
</template>

<script>
import SetupForm from './components/SetupForm.vue';
import LogDisplay from './components/LogDisplay.vue';

export default {
  data() {
    return {
      logs: []
    };
  },
  components: {
    SetupForm,
    LogDisplay
  },
  methods: {
    async startSweep(data) {
      try {
        const result = await window.electronAPI.startSweep(data);
        this.logs.push(result);
      } catch (error) {
        this.logs.push(`Error: ${error.message}`);
      }
    }
  }
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>
