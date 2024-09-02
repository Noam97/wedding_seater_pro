<template>
  <div class="flex justify-center items-center gap-20 min-h-screen">
    <!-- Error Display -->
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

    <!-- Seating Arrangement Display -->
    <div v-else class="text-center absolute top-16">
      <h1 class="text-4xl text-primary-color uppercase mb-8">SEATING ARRANGEMENT</h1>
      <div
          class="flex justify-around items-center gap-16 border border-purple-300 rounded-xl shadow-md px-6 py-2 w-full"
          style="margin-bottom: 0;"
      >
        <div class="flex justify-center gap-20">
          <button
              @click="initiateSave"
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
            @update:people="updateTableGuests(tableData.table.id, $event)"
        ></table-with-chairs>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
        :show="showModal"
        :logs="logs"
        :isConfirmed="confirmationMade"
        :message="confirmationMessage"
        :lastAction="lastAction"
        @confirm="confirmSave"
        @discard="discardChanges"
        @close="closeModal"
    />

    <!-- Unchanged Arrangement Modal -->
    <div
        v-if="showUnchangedModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 class="text-lg font-bold mb-4">Seating arrangement unchanged!</h2>
        <button
            @click="closeUnchangedModal"
            class="bg-orange-500 text-white px-4 py-2 rounded duration-300 hover:bg-orange-700 hover:text-white hover:shadow-md mt-4"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ExcelDownload from "@/components/ExcelDownload.vue";
import TableWithChairs from "@/components/TableWithChairs.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import { useStore } from "@/store/index.js";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();
const results = ref([]);
const errGenerate = ref("");
const previousState = ref([]);
const showModal = ref(false);
const showUnchangedModal = ref(false); // New state for unchanged modal
const logs = ref([]);
const confirmationMade = ref(false);
const confirmationMessage = ref("");
const lastAction = ref(""); // Track the last action to style the Close button

async function init() {
  try {
    const savedResults = localStorage.getItem("seatingArrangement");
    results.value = savedResults
        ? JSON.parse(savedResults)
        : (await store.generateTables()).data;
    previousState.value = JSON.parse(JSON.stringify(results.value));
  } catch (error) {
    console.log(error);
    errGenerate.value = error.response.data.error;
    results.value = [];
  }
}

init();

const sortedResults = computed(() => {
  return results.value
      .slice()
      .sort((a, b) => a.table.table_number - b.table.table_number);
});

const excelData = computed(() => {
  const data = results.value.flatMap((result) =>
      result.guests.map((guest) => [
        result.table["table_number"],
        guest.name,
        guest.count,
      ])
  );
  data.sort((a, b) => a[0] - b[0]);
  return data;
});

async function updateTableGuests(tableId, updatedGuests) {
  const table = results.value.find((t) => t.table.id === tableId);
  if (table) {
    table.guests = updatedGuests;
  } else {
    console.error("Table not found with ID:", tableId);
  }
}

function initiateSave() {
  const prevState = JSON.parse(JSON.stringify(previousState.value));
  const newState = JSON.parse(JSON.stringify(results.value));
  const changes = trackChanges(prevState, newState);

  if (!changes || changes.length <= 0) {
    showUnchangedModal.value = true; // Show the unchanged modal
    return;
  }

  logs.value = changes;
  showModal.value = true;
  confirmationMade.value = false;
}

function confirmSave() {
  localStorage.setItem("seatingArrangement", JSON.stringify(results.value));
  confirmationMessage.value = "Seating arrangement saved!";
  confirmationMade.value = true;
  lastAction.value = "confirm";
}

function discardChanges() {
  results.value = JSON.parse(JSON.stringify(previousState.value));
  confirmationMessage.value = "Changes discarded!";
  confirmationMade.value = true;
  lastAction.value = "discard";
}

function closeModal() {
  showModal.value = false;
  confirmationMade.value = false;
  confirmationMessage.value = "";
  lastAction.value = ""; // Reset the last action
}

function closeUnchangedModal() {
  showUnchangedModal.value = false;
}

function trackChanges(state1, state2) {
  const createGuestTableMap = (state) => {
    const guestTableMap = {};
    state.forEach(({ guests, table }) => {
      guests.forEach((guest) => {
        guestTableMap[`${guest.name}_${guest.id}`] = table.table_number;
      });
    });
    return guestTableMap;
  };

  const state1Map = createGuestTableMap(state1);
  const state2Map = createGuestTableMap(state2);

  const logEntries = [];

  Object.keys(state1Map).forEach((guestKey) => {
    if (
        state2Map[guestKey] !== undefined &&
        state1Map[guestKey] !== state2Map[guestKey]
    ) {
      const [name, id] = guestKey.split("_");
      logEntries.push(
          `Guest ${name} moved from table ${state1Map[guestKey]} to table ${state2Map[guestKey]}`
      );
    }
  });

  Object.keys(state2Map).forEach((guestKey) => {
    if (state1Map[guestKey] === undefined) {
      const [name, id] = guestKey.split("_");
      logEntries.push(`Guest ${name} appeared at table ${state2Map[guestKey]}`);
    }
  });

  Object.keys(state1Map).forEach((guestKey) => {
    if (state2Map[guestKey] === undefined) {
      const [name, id] = guestKey.split("_");
      logEntries.push(
          `Guest ${name} was removed from table ${state1Map[guestKey]}`
      );
    }
  });

  return logEntries;
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
