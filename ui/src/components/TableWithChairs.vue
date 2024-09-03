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
const originalPeople = ref([]);  // to store the original state
const originalTotalGuests = ref(totalGuests.value);
const showErrorModal = ref(false);
const actionInProgress = ref(false);

// Initialize original state
watch(
    () => props.people,
    (newPeople) => {
      people.value = [...newPeople];
      totalGuests.value = calculateTotalGuests(newPeople);
      originalPeople.value = JSON.parse(JSON.stringify(newPeople)); // Save the original state correctly
      originalTotalGuests.value = calculateTotalGuests(newPeople); // Save the original total
      console.log(`Table ${props.tableNumber}: Watch triggered - People updated:`, JSON.stringify(people.value));
      console.log(`Table ${props.tableNumber}: Watch triggered - Total guests updated:`, totalGuests.value);
    },
    { deep: true, immediate: true }
);

function calculateTotalGuests(peopleArray) {
  return peopleArray.reduce((total, guest) => total + guest.count, 0);
}

function closeErrorModal() {
  showErrorModal.value = false;
}

function onDragStart() {
  originalPeople.value = JSON.parse(JSON.stringify(people.value)); // Deep copy to preserve original state
  originalTotalGuests.value = totalGuests.value;
  actionInProgress.value = true;

  console.log(`Table ${props.tableNumber}: Drag started`);
  console.log(`Table ${props.tableNumber}: Original people state:`, JSON.stringify(originalPeople.value));
  console.log(`Table ${props.tableNumber}: Original totalGuests:`, originalTotalGuests.value);
}

function onDragEnd() {
  console.log(`Table ${props.tableNumber}: Drag ended`);
  actionInProgress.value = false;

  // Update last valid state after drag end for both tables
  originalPeople.value = JSON.parse(JSON.stringify(people.value));
  originalTotalGuests.value = totalGuests.value;
  console.log(`Table ${props.tableNumber}: Updated last valid state after drag end.`);
}

async function onGuestAdded(event) {
  console.log(`Table ${props.tableNumber}: Guest added`);
  await nextTick();
  const newTotalGuests = calculateTotalGuests(people.value);

  console.log(`Table ${props.tableNumber}: New totalGuests after add:`, newTotalGuests);
  console.log(`Table ${props.tableNumber}: Current people state after add:`, JSON.stringify(people.value));

  if (newTotalGuests > props.chairs) {
    showErrorModal.value = true;

    console.log(`Table ${props.tableNumber}: Exceeded number of chairs, reverting changes.`);

    // Revert the item back to its original position in DOM
    event.from.insertBefore(event.item, event.from.children[event.oldIndex]);

    // Wait for next DOM update cycle to ensure no residual changes remain
    await nextTick(() => {
      resetState();  // Reset destination table
      emit('update:people', people.value); // Emit to notify state change

      // Emit a custom event to notify the source table to reset
      const sourceTableComponent = event.from.__vueParentComponent.ctx; // Get the source table component
      if (sourceTableComponent && sourceTableComponent.resetState) {
        console.log(`Table ${props.tableNumber}: Resetting source table state.`);
        sourceTableComponent.resetState();  // Reset source table
        emit('update:people', sourceTableComponent.people.value); // Emit to notify state change of source table
      }
    });

  } else {
    totalGuests.value = newTotalGuests;
    emit('update:people', people.value);

    console.log(`Table ${props.tableNumber}: Valid move, updated state.`);
    console.log(`Table ${props.tableNumber}: Updated people state:`, JSON.stringify(people.value));
    console.log(`Table ${props.tableNumber}: Updated totalGuests:`, totalGuests.value);
  }
}

function resetState() {
  console.log(`Table ${props.tableNumber}: Resetting state...`);
  console.log(`Table ${props.tableNumber}: Last valid people state before reset:`, JSON.stringify(originalPeople.value));
  console.log(`Table ${props.tableNumber}: Last valid totalGuests before reset:`, originalTotalGuests.value);

  // Reset to original state
  people.value = JSON.parse(JSON.stringify(originalPeople.value));
  totalGuests.value = originalTotalGuests.value;

  console.log(`Table ${props.tableNumber}: People state after reset:`, JSON.stringify(people.value));
  console.log(`Table ${props.tableNumber}: Total guests after reset:`, totalGuests.value);

  actionInProgress.value = false;

  // Emit to ensure the state is consistent
  emit('update:people', people.value);
}




function onGuestRemoved() {
  console.log(`Table ${props.tableNumber}: Guest removed`);
  totalGuests.value = calculateTotalGuests(people.value);
  emit('update:people', people.value);

  console.log(`Table ${props.tableNumber}: People state after removal:`, JSON.stringify(people.value));
  console.log(`Table ${props.tableNumber}: Total guests after removal:`, totalGuests.value);
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
