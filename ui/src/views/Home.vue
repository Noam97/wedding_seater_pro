<template>
  <div>
    <h1 class="text-xl">
      WELCOME!
    </h1>

    <button @click="openCard = true">
      To add an event click here!
    </button>

    <div v-if="openCard" class="card">
      <form
          class="flex flex-col justify-center items-center border-2 border-gray-200 py-4 px-6 sm:px-10 rounded-lg shadow-md lg:w-2/3 xl:w-1/3 w-screen "
          @submit.prevent="newEvent">
        <div>
          <input type="file" @change="handleFileChange" style="display:none" ref="fileInput">
          <button type="button" @click="openFileDialog">Import guests table</button>
          <button type="button" @click="exportExcel">Export guests table</button>
        </div>

        <button type="button" @click="newTable = !newTable">
          Adding a table
        </button>

        <div v-if="newTable">
          <div>
            <label for="tables">
              Number of tables
            </label>
            <input
                v-model="payload.tables"
                type="number"
                id="tables"
                placeholder="כמות שולחנות"
                class="duration-300 border-2 py-1 px-2"
            />
          </div>
          <div>
            <label for="chairs">
              Number of chairs at the table
            </label>
            <input
                v-model="payload.chairs"
                type="number"
                id="chairs"
                placeholder="כמות כיסאות בשולחן"
                class="duration-300 border-2 py-1 px-2"
            />
          </div>
        </div>

        <button type="button" @click="guest = !guest">
          + Adding a guest
        </button>

        <div v-if="guest">
          <div>
            <label for="name">
              Name
            </label>
            <input
                v-model="payload.name"
                id="name"
                placeholder="שם האורח"
                class="duration-300 border-2 py-1 px-2"
            />
          </div>
          <div>
            <label for="guestCount">
            Number of guests
            </label>
            <input
                v-model="payload.guestCount"
                type="number"
                id="guestCount"
                placeholder="כמות אורחים"
                class="duration-300 border-2 py-1 px-2"
            />
          </div>
          <div>
            <label for="side">
              side
            </label>
            <input
                v-model="payload.side"
                type="radio"
                id="bride"
                value="bride"
                class="duration-300 border-2 py-1 px-2"
            />
            <label for="bride">
              bride
            </label>

            <input
                v-model="payload.side"
                type="radio"
                id="groom"
                value="groom"
                class="duration-300 border-2 py-1 px-2"
            />
            <label for="groom">
              groom
            </label>

            <input
                v-model="payload.side"
                type="radio"
                id="shared"
                value="shared"
                class="duration-300 border-2 py-1 px-2"
            />
            <label for="shared">
              common
            </label>
          </div>
          <div>
            <label for="relation">
              Relationship
            </label>
            <select v-model="payload.relation" id="relation">
              <option>Immediate family</option>
              <option>Extended family</option>
              <option>Friends</option>
              <option>Work</option>
              <option>Parent's guests</option>
            </select>

          </div>
        </div>
      </form>

      <button @click="openCard = false">
        X
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';

const openCard = ref(false);
const newTable = ref(false);
const guest = ref(false);
const payload = ref({
  tables: 0,
  chairs: 0,
  name: '',
  guestCount: 0,
  side: '',
  relation: ''
});

function newEvent() {
  console.log('new event');
}

function openFileDialog() {
  this.$refs.fileInput.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith('.xlsx')) {
    alert('Please upload a file in .xlsx format');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

    const requiredColumns = ['Side', 'Relationship, Guest, Amount, Phone number'];
    const fileColumns = Object.keys(jsonData[0]);
    const valid = requiredColumns.every(col => fileColumns.includes(col));

    if (!valid) {
      alert('The columns of the uploaded file do not match the required columns.');
      return;
    }

    console.log(jsonData);
  };
  reader.readAsArrayBuffer(file);
}

function exportExcel() {
  const link = document.createElement('a');
  link.href = 'guest.xlsx';
  link.download = 'guest.xlsx';
  link.click();
}
</script>

<style scoped>
.card {
  width: 100vw;
  border: 2px solid red;
  padding: 10px 20px;
  font-size: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

form {
  display: flex;
  flex-direction: column;
}

form button {
  border: 2px solid blue;
}

select {
  border: 2px solid darkgreen;
}
</style>
