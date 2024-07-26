<template>
  <div class="flex justify-center items-center gap-20 min-h-screen">
    <TableWithChairs v-for="(result, index) in results" :key="index" :chairs="result.table['places_count']" :people="result.guests" :guests-count="result.guestsCount" />
  </div>
</template>

<script setup>
import TableWithChairs from "@/components/TableWithChairs.vue";
import {useStore} from "@/store/index.js";
import {ref} from "vue";

const store = useStore()
let results = ref([])

init()

async function init() {
  try {
    results.value = (await store.generateTables()).data
    console.log(results.value)
  } catch (error) {
    console.log(error)
    results.value = []
  }
}
</script>

<style scoped>

</style>