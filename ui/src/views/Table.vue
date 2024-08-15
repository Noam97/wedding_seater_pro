<template>
  <div class="flex justify-center items-center gap-20 min-h-screen">
    <div v-if="errGenerate.length" class="text-center mb-5 text-5xl text-primary-color">
      <p>{{ errGenerate }}</p>
      <div class="flex justify-center items-center mt-10">
        <img src="../assets/images/brideAndGroomWorried.webp" class="w-[300px] h-[300px]" />
      </div>
      <button
          class="mt-10 duration-300 border-2 border-primary-color bg-primary-color text-white rounded-xl px-10 py-2 hover:shadow-md"
          @click="router.push('/')">
        Go Home
      </button>
    </div>
    <div v-else class="text-center absolute top-16">
      <h1 class="text-5xl text-primary-color">SEATING ARRANGEMENT</h1>
      <div v-if="excelData.length" class="mt-2 text-4xl">
        <ExcelDownload
            :data="excelData"
            :headers="['Table Number', 'Name', 'Count']"
            :sheetName="`Seating Arrangement`"
            :fileName="`Seating Arrangement.xlsx`"
            buttonText="Download Excel"
            class="text-lg">
        </ExcelDownload>
      </div>
    </div>
    <TableWithChairs
        v-for="(result, index) in results"
        :key="index"
        :chairs="result.table['places_count']"
        :people="result.guests"
        :guests-count="result.guestsCount"
        :table-number="result.table['table_number']">
    </TableWithChairs>
  </div>
</template>


<script setup>
import ExcelDownload from '@/components/ExcelDownload.vue';
import TableWithChairs from "@/components/TableWithChairs.vue";
import { useStore } from "@/store/index.js";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();
let results = ref([]);
let errGenerate = ref("");

async function init() {
  try {
    results.value = (await store.generateTables()).data;
    console.log("Results:", results.value);
  } catch (error) {
    console.log(error);
    errGenerate.value = error.response.data.error;
    results.value = [];
  }
}

let excelData = computed(() => {
  const data = results.value.flatMap(result =>
      result.guests.map(guest => [
        result.table['table_number'],
        guest.name,
        guest.count
      ])
  );
  data.sort((a, b) => a[0] - b[0]);
  console.log("Excel Data in Table.vue:", data);
  return data;
});

init();
</script>

<style scoped>
</style>
