<template>
  <div class="flex justify-center items-center gap-20 min-h-screen">
    <div v-if="errGenerate.length" class="text-5xl text-purple-500" >
      {{errGenerate}}
      <br><br><br>
      <button  @click="router.push('/')">
        Click here
      </button>
        to go back and update the table
    </div>
    <TableWithChairs v-for="(result, index) in results" :key="index" :chairs="result.table['places_count']" :people="result.guests" :guests-count="result.guestsCount" />
  </div>
</template>

<script setup>
import TableWithChairs from "@/components/TableWithChairs.vue";
import {useStore} from "@/store/index.js";
import {ref} from "vue";
import {useRouter} from "vue-router";

const store = useStore()
const router = useRouter()
let results = ref([])
let errGenerate = ref("")

init()

async function init() {
  try {
    results.value = (await store.generateTables()).data
    console.log(results.value)
  } catch (error) {
    console.log(error)
    errGenerate.value = error.response.data.error
    results.value = []
  }
}
</script>

<style scoped>

</style>