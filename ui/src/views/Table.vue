

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
      <h1 class="text-4xl text-primary-color uppercase mb-8">SEATING ARRANGEMENT</h1>
      <div class="flex justify-around items-center gap-16 border border-purple-300 rounded-xl shadow-md px-6 py-2 w-full" style="margin-bottom: 0;">
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
                class="text-lg">
            </ExcelDownload>
          </button>
        </div>
      </div>
    </div>

    <div class="tables-container">
      <div v-for="(result, index) in sortedResults" :key="index">
        <div class="table-with-chairs">

        <h2 class="table-title">Table {{ result.table['table_number'] }}</h2>
          <div class="guest-list full-drop-area">
            <draggable class="full-drop-area" :list="result.guests" group="guests" :item-key="'id'" @change="onGuestMoved">
              <template #item="{ element }">
                <div class="guest-item">
                  {{ element.name }} ({{ element.count }})
                  <i class="fas fa-arrows-alt"></i>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ExcelDownload from '@/components/ExcelDownload.vue';
import { useStore } from "@/store/index.js";
import { ref, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import draggable from 'vuedraggable';

const store = useStore();
const router = useRouter();
let results = ref([]);
let errGenerate = ref("");

function onGuestMoved(event) {
  console.log('Event Object:', event);
}

async function init() {
  try {
    const savedResults = localStorage.getItem('seatingArrangement');
    if (savedResults) {
      results.value = JSON.parse(savedResults);
    } else {
      results.value = (await store.generateTables()).data;
    }
    console.log("Results:", results.value);
  } catch (error) {
    console.log(error);
    errGenerate.value = error.response.data.error;
    results.value = [];
  }
  console.log("Sorted Results:", sortedResults.value);
}

function saveState() {
  localStorage.setItem('seatingArrangement', JSON.stringify(results.value));
  alert('Seating arrangement saved!');
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
  return data;
});

init();
</script>


<style scoped>

.tables-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: row;
}

.table-with-chairs {
  position: relative;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 2px solid #D8BFD8;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
  overflow: visible;
}

.table-title {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  color: #333;
  background-color: white;
  padding: 3px 10px;
  border-radius: 10px;
  text-align: center;
  z-index: 10;
}

.tables-container {
  margin-top: -200px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  flex-direction: row;
}

.guest-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  justify-content: center;
  align-items: start;
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  overflow: visible;
  margin-top: 30px;
}

.guest-item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 3px;
  box-sizing: border-box;
  cursor: grab;
}

.fa-arrows-alt {
  cursor: grab;
}
.full-drop-area {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

</style>