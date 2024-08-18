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

    <div class="tables-container">
      <div v-for="(result, index) in sortedResults" :key="index" class="table-with-chairs">
        <h2 class="table-title">Table {{ result.table['table_number'] }}</h2>
        <draggable
            :list="result.guests"
            :group="{ name: 'guests', pull: true, put: true }"
            @change="onGuestMoved">
          <template #item="{ element }">
            <div class="guest-item">
              <span>{{ element.name }} ({{ element.count }})</span>
              <i class="fas fa-arrows-alt drag-icon"></i>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup>
import ExcelDownload from '@/components/ExcelDownload.vue';
import { useStore } from "@/store/index.js";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();
let results = ref([]);
let errGenerate = ref("");

function onGuestMoved(event) {
  console.log('Guest moved:', event);
}

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

let sortedResults = computed(() => {
  return results.value.slice().sort((a, b) => a.table['table_number'] - b.table['table_number']);
});

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
.table-with-chairs {
  width: 300px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.table-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}
.tables-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  flex-direction: row;
}
.guest-item {
  padding: 5px;
  margin: 5px 0;
  background-color: #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drag-icon {
  cursor: grab;
  margin-left: auto;
}
</style>
