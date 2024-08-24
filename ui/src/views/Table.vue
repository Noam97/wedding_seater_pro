<template>
  <div class="flex justify-center items-center gap-20 min-h-screen">
    <div v-if="errGenerate.length" class="text-center mb-5 text-5xl text-primary-color">
      <p>{{ errGenerate }}</p>
      <div class="flex justify-center items-center mt-10">
        <img src="../assets/images/brideAndGroomWorried.webp" class="w-[300px] h-[300px]" />
      </div>
      <button
          class="mt-10 duration-300 border-2 border-primary-color bg-primary-color text-white rounded-xl px-10 py-2 hover:shadow-md"
          @click="router.push('/')"
      >
        Go Home
      </button>
    </div>
    <div v-else class="text-center absolute top-16">
      <h1 class="text-4xl text-primary-color uppercase mb-8">SEATING ARRANGEMENT</h1>
      <div class="flex justify-around items-center gap-16 border border-purple-300 rounded-xl shadow-md px-6 py-2 w-full"
           style="margin-bottom: 0;">
        <div class="flex justify-center gap-20">
          <button
              @click="saveState"
              class="duration-300 border-2 border-primary-color text-primary-color rounded-xl px-10 py-2 hover:bg-primary-color hover:text-white hover:shadow-md"
          >
            Save Changes
          </button>

          <button
              v-if="excelData.length"
              class="duration-300 border-2 border-primary-color text-primary-color rounded-xl px-10 py-2 hover:bg-primary-color hover:text-white hover:shadow-md"
          >
            <ExcelDownload
                :data="excelData"
                :headers="['Table Number', 'Name', 'Count']"
                :sheetName="`Seating Arrangement`"
                :fileName="`Seating Arrangement.xlsx`"
                buttonText="Download Excel"
                class="text-lg"
            />
          </button>
        </div>
      </div>

      <div class="tables-container">
        <table-with-chairs
            v-for="(tableData, index) in sortedResults"
            :key="index"
            :table-data="tableData"
            :chairs="tableData.table.places_count"
        :people="tableData.guests"
        :table-number="tableData.table.table_number"
        :guests-count="tableData.guests.length"
        ></table-with-chairs>
      </div>
    </div>
  </div>
</template>

<script setup>
import ExcelDownload from '@/components/ExcelDownload.vue';
import TableWithChairs from '@/components/TableWithChairs.vue';
import { useStore } from "@/store/index.js";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();
let results = ref([]);
let errGenerate = ref("");

async function init() {
  try {
    const savedResults = localStorage.getItem('seatingArrangement');
    results.value = savedResults ? JSON.parse(savedResults) : (await store.generateTables()).data;
  } catch (error) {
    console.log(error);
    errGenerate.value = error.response.data.error;
    results.value = [];
  }
}

init();

const sortedResults = computed(() => {
  return results.value.slice().sort((a, b) => a.table.table_number - b.table.table_number);
});

const excelData = computed(() => {
  const data = results.value.flatMap(result =>
      result.guests.map(guest => [
        result.table['table_number'],
        guest.name,
        guest.count
      ])
  );
  data.sort((a, b) => a[0] - b[0]);
  return data;
});

function saveState() {
  localStorage.setItem('seatingArrangement', JSON.stringify(results.value));
  alert('Seating arrangement saved!');
}
</script>

<style scoped>
.tables-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  flex-direction: row;
  padding-top: 100px;
}
</style>
