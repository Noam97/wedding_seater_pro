<template>
  <div class=" flex justify-center items-center gap-20 min-h-screen">
    <div v-if="errGenerate.length"
         class="text-center mb-5 text-5xl text-primary-color" >
     <p> {{errGenerate}}</p>
      <div class="flex justify-center item-center mt-10">
        <img src="../assets/images/brideAndGroomWorried.webp"
             class="w-[300px] h-[300px]"/>
      </div>
      <button
          class="mt-10 duration-300 border-2 border-primary-color bg-primary-color text-white rounded-xl px-10 py-2 hover:shadow-md"
          @click="router.push('/')">
       Go Home
      </button>
    </div>
    <h1 v-else class="text-5xl text-primary-color absolute top-16">TABLE ORGANIZATION</h1>
    <TableWithChairs v-for="(result, index) in results"
           :key="index" :chairs="result.table['places_count']"
           :people="result.guests"
           :guests-count="result.guestsCount"
           :table-number="result.table['table_number']">

    </TableWithChairs>
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