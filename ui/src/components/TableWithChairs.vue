<template>
  <div class="table-with-chairs">
    <h2 class="table-title">Table {{ tableNumber }}</h2>
    <div class="table-overview">Total Guests: {{ totalGuests }} / {{ chairs }}</div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal">
        <p class="text-lg font-bold mb-4">Error: Number of guests exceeds the number of available chairs!</p>
        <button @click="closeErrorModal" class="bg-orange-500 text-white px-4 py-2 rounded duration-300 hover:bg-orange-700 hover:text-white hover:shadow-md">
          Close
        </button>
      </div>
    </div>

    <!-- Draggable Guests -->
    <draggable class="full-drop-area" :list="people" group="guests" :item-key="'id'" :key="`table_${tableNumber}`"
               @start="onDragStart" @end="onDragEnd" @add="onGuestAdded" @remove="onGuestRemoved">
      <template #item="{ element }">
        <div class="guest-item">
          {{ element.name }} ({{ element.count }})
          <i class="fas fa-arrows-alt"></i>
        </div>
      </template>
    </draggable>
    <div v-for="(chair, index) in allChairs" :key="`chair_${index}`" :class="getChairClass(index)"
         :style="getChairStyle(index)"></div>
  </div>
</template>


<script setup>
import draggable from 'vuedraggable';
import { defineProps, defineEmits, ref, nextTick, watch } from 'vue';

const props = defineProps({
  tableData: Object,
  chairs: {
    type: Number,
    default: 0,
  },
  people: {
    type: Array,
    default: () => [],
  },
  tableNumber: Number,
  guestsCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['update:people']);

const people = ref([...props.people]);
const allChairs = ref(props.chairs);
const totalGuests = ref(calculateTotalGuests(people.value));

// Non-reactive state to store the original state
let originalPeople = JSON.parse(JSON.stringify(props.people));
let originalTotalGuests = calculateTotalGuests(props.people);
const showErrorModal = ref(false);
const actionInProgress = ref(false);

// Watcher to keep track of changes to props.people and initialize original states
watch(
    () => props.people,
    (newPeople) => {
      people.value = [...newPeople];
      totalGuests.value = calculateTotalGuests(newPeople);
      originalPeople = JSON.parse(JSON.stringify(newPeople)); // Save the original state correctly
      originalTotalGuests = calculateTotalGuests(newPeople); // Save the original total
      console.log('Watch triggered: People updated:', people.value);
      console.log('Watch triggered: Total guests updated:', totalGuests.value);
    },
    { deep: true, immediate: true }
);

function calculateTotalGuests(peopleArray) {
  return peopleArray.reduce((total, guest) => total + guest.count, 0);
}

function closeErrorModal() {
  showErrorModal.value = false;
}

function resetState() {
  console.log('Resetting state...');
  console.log('Original people state before reset:', originalPeople);
  console.log('Original totalGuests before reset:', originalTotalGuests);

  // Reset to original state
  people.value = JSON.parse(JSON.stringify(originalPeople));
  totalGuests.value = originalTotalGuests;

  console.log('People state after reset:', people.value);
  console.log('Total guests after reset:', totalGuests.value);

  actionInProgress.value = false;

  // Emit update to ensure state is consistent after reset
  emit('update:people', people.value);
}

function onDragStart() {
  originalPeople = JSON.parse(JSON.stringify(people.value)); // Deep copy to preserve original state
  originalTotalGuests = totalGuests.value;
  actionInProgress.value = true;

  console.log('Drag started');
  console.log('Original people state:', originalPeople);
  console.log('Original totalGuests:', originalTotalGuests);
}

function onDragEnd() {
  console.log('Drag ended');
  actionInProgress.value = false;
}

async function onGuestAdded(event) {
  console.log('Guest added');
  await nextTick();

  // Calculate new total guests but don't update `totalGuests` yet
  const newTotalGuests = calculateTotalGuests(people.value);

  console.log('New totalGuests after add:', newTotalGuests);
  console.log('Current people state after add:', people.value);

  if (newTotalGuests > props.chairs) {
    showErrorModal.value = true;

    console.log('Exceeded number of chairs, reverting changes.');

    // Revert the item back to its original position in DOM
    event.from.insertBefore(event.item, event.from.children[event.oldIndex]);

    // Wait for next DOM update cycle to ensure no residual changes remain
    await nextTick(() => {
      resetState();  // Ensure proper reset for the current table
    });
  } else {
    // Only now, update `totalGuests` after confirming the move is valid
    totalGuests.value = newTotalGuests;
    emit('update:people', people.value);

    console.log('Valid move, updated state.');
    console.log('Updated people state:', people.value);
    console.log('Updated totalGuests:', totalGuests.value);
  }
}

function onGuestRemoved(event) {
  console.log('Guest removed');

  // Do not update totalGuests here; only calculate the new value
  const newTotalGuests = calculateTotalGuests(people.value);

  console.log('People state after removal:', people.value);
  console.log('Total guests after removal:', newTotalGuests);

  // Do not update totalGuests.value here, wait for the confirmation of the move.
}

function getChairStyle(index) {
  const radius = 130;
  const angle = (2 * Math.PI) / props.chairs * index;
  const x = Math.cos(angle) * radius + 130;
  const y = Math.sin(angle) * radius + 130;
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)'
  };
}

// Correctly define the getChairClass function
function getChairClass(index) {
  return index < totalGuests.value ? 'chair active' : 'chair no-active';
}
</script>

<style scoped>
.table-with-chairs {
  position: relative;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 2px solid #D8BFD8;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  margin-bottom: 20px;
}

.table-title {
  font-size: 1.2rem;
  color: #333;
  background-color: white;
  padding: 3px 10px;
  border-radius: 10px;
  text-align: center;
  z-index: 10;
  margin-bottom: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 1001;
}

.full-drop-area {
  width: 100%;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: auto;
}

.guest-item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 5px;
  margin: 5px 0;
  box-sizing: border-box;
  cursor: grab;
  background-color: #f0f0f0;
  border-radius: 8px;
  width: 80%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chair {
  width: 40px;
  height: 40px;
  background-color: #ccc;
  border-radius: 50%;
  border: 1px solid #333;
}

.active {
  background-color: var(--primary-color);
}

.no-active {
  background-color: #ccc;
}
</style>
