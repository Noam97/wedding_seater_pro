<template>
  <div class="table-with-chairs">
    <h2 class="table-title">Table {{ tableNumber }}</h2>
    <div class="table-overview">Total Guests: {{ totalGuests }} / {{ chairs }}</div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal">
        <!-- Error message styled like "Changes Detected" -->
        <p class="text-lg font-bold mb-4">Error: Number of guests exceeds the number of available chairs!</p>
        <!-- Close button styled like "Discard Changes" button -->
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
const originalPeople = ref([...props.people]);
const originalTotalGuests = ref(calculateTotalGuests(props.people));
const showErrorModal = ref(false);
const actionInProgress = ref(false);

function calculateTotalGuests(peopleArray) {
  return peopleArray.reduce((total, guest) => total + guest.count, 0);
}

function closeErrorModal() {
  showErrorModal.value = false;
}

function recheckTotalGuests() {
  const tableWithChairs = document.querySelector('.table-with-chairs');
  for (let i = 0; i < tableWithChairs.length; i++) {
    const tableOverview = tableWithChairs[i].getElementsByClassName('table-overview');
    const str = tableOverview[i].textContent;
    const matchTotal = str.match(/(\d+) \/ (\d+)/);
    const totalChairs = parseInt(matchTotal[2], 10);
    let totalGuests = 0;
    const guestItems = tableWithChairs[i].getElementsByClassName('guest-item');
    for (let j = 0; j < guestItems.length; j++) {
      const text = guestItems[j].textContent;
      const match = text.match(/(\d+)/);
      const guestCount = parseInt(match[1], 10);
      totalGuests += guestCount;
    }
    tableOverview[i].textContent = `Total Guests: ${totalGuests} / ${totalChairs}`;
  }
}

function resetState() {
  people.value = [...originalPeople.value];
  totalGuests.value = originalTotalGuests.value;
  actionInProgress.value = false;
  recheckTotalGuests();
}

function onDragStart() {
  originalPeople.value = [...people.value];
  originalTotalGuests.value = totalGuests.value;
  actionInProgress.value = true;
}

function onDragEnd() {
  actionInProgress.value = false;
  recheckTotalGuests();
}

async function onGuestAdded(event) {
  await nextTick();
  const newTotalGuests = calculateTotalGuests(people.value);
  if (newTotalGuests > props.chairs) {
    showErrorModal.value = true;
    event.from.insertBefore(event.item, event.from.children[event.oldIndex]);
    await nextTick(() => {
      const parentElement = event.from.parentElement;
      const guestItems = parentElement.getElementsByClassName('guest-item');
      const str = event.from.parentElement.children[1].textContent;
      const matchTotal = str.match(/(\d+) \/ (\d+)/);
      const totalChairs = parseInt(matchTotal[2], 10);
      let totalGuests = 0;
      for (let i = 0; i < guestItems.length; i++) {
        const text = guestItems[i].textContent;
        const match = text.match(/(\d+)/);
        const guestCount = parseInt(match[1], 10);
        totalGuests += guestCount;
      }
      event.from.parentElement.children[1].textContent = `Total Guests: ${totalGuests} / ${totalChairs}`;
      resetState();
    });
  } else {
    totalGuests.value = newTotalGuests;
    emit('update:people', people.value);
  }
}

function onGuestRemoved() {
  totalGuests.value = calculateTotalGuests(people.value);
  emit('update:people', people.value);
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

watch(
    () => props.people,
    (newPeople) => {
      people.value = [...newPeople];
      totalGuests.value = calculateTotalGuests(newPeople);
    },
    { deep: true, immediate: true }
);
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