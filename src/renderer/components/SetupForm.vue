<template>
  <div class="setup-form">
    <h2>Setup Sweep</h2>
    <form @submit.prevent="submitForm">
      <div>
        <label for="url">URL</label>
        <input type="text" id="url" v-model="url" required/>
      </div>
      <div>
        <label for="scenarioFilePath">Scenario File Path</label>
        <input type="text" id="scenarioFilePath" v-model="scenarioFilePath" required/>
      </div>
      <div>
        <label for="sweepName">Sweep Name</label>
        <input type="text" id="sweepName" v-model="sweepName" required/>
      </div>
      <button type="submit">Start Sweep</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: '',
      scenarioFilePath: '',
      sweepName: ''
    };
  },
  methods: {
    submitForm() {
      const config = {
        url: this.url,
        scenarioFilePath: this.scenarioFilePath,
        sweepName: this.sweepName
      };
      this.$emit('startSweep', config);
    }
  }
};
</script>

<style scoped>
.setup-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
form {
  display: flex;
  flex-direction: column;
  width: 300px;
}
div {
  margin-bottom: 10px;
}
button {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #39a373;
}
</style>
