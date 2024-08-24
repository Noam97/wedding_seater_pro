<template>
  <div class="table-with-chairs">
    <h2 class="table-title">Table {{ tableNumber }}</h2>
    <div>Total Guests: {{ totalGuests }} / {{ chairs }}</div>

    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal">
        <p>Error: Number of guests exceeds the number of available chairs!</p>
        <button @click="closeErrorModal">Close</button>
      </div>
    </div>

    <draggable
        class="full-drop-area"
        :list="people"
        group="guests"
        :item-key="'id'"
        @start="onDragStart"
        @end="onDragEnd"
        @add="onGuestAdded"
        @remove="onGuestRemoved"
    >
      <template #item="{ element, index }">
        <div class="guest-item">
          {{ element.name }} ({{ element.count }})
          <i class="fas fa-arrows-alt"></i>
        </div>
      </template>
    </draggable>

    <div
        v-for="(chair, index) in chairs"
        :key="`chair_${index}`"
        :class="getChairClass(index)"
        :style="getChairStyle(index)"
    ></div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable';
import { computed, defineProps, ref, nextTick } from 'vue';

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

const people = ref([...props.people]); // Local definition of people
const originalPeople = ref([...props.people]); // To store the original state of the people
const showErrorModal = ref(false); // State to control error modal visibility
const totalGuests = ref(calculateTotalGuests()); // Use a ref to store totalGuests count

// Function to calculate total guests
function calculateTotalGuests() {
  return people.value.reduce((total, guest) => total + guest.count, 0);
}

// Update totalGuests only if there is no error
function updateGuestCounts() {
  if (!showErrorModal.value) {
    totalGuests.value = calculateTotalGuests();
  }
}

function closeErrorModal() {
  showErrorModal.value = false;
  updateGuestCounts(); // Recalculate total guests when error is resolved
}

function onDragStart() {
  originalPeople.value = [...people.value]; // Save the original state of the table
}

function onDragEnd() {
  // This function remains empty to prevent conflicts with add and remove events
}

function onGuestAdded(event) {
  if (calculateTotalGuests() > props.chairs) {
    showErrorModal.value = true;
    nextTick(() => {
      // Remove the added guest if the number of guests exceeds the available chairs
      event.from.insertBefore(event.item, event.from.children[event.oldIndex]);
      people.value = [...originalPeople.value]; // Restore the original state of the table if there is an overflow
    });
  } else {
    // Update guest counts if there is no overflow
    updateGuestCounts();
  }
}

function onGuestRemoved(event) {
  if (calculateTotalGuests() > props.chairs) {
    nextTick(() => {
      people.value = [...originalPeople.value]; // Restore the original state if there is an overflow
    });
  } else {
    // Update guest counts if there is no overflow
    updateGuestCounts();
  }
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

.modal button {
  margin-top: 10px;
  padding: 5px 10px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
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
