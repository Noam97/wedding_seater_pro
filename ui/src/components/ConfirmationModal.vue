<!-- ConfirmationModal.vue -->
<template>
  <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div
        class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
        :style="isConfirmed ? 'max-width: 300px; text-align: center;' : ''"
    >
      <!-- Display logs only if no action is confirmed -->
      <div v-if="!isConfirmed">
        <h2 class="text-lg font-bold mb-4">Changes Detected</h2>
        <ul class="mb-4">
          <li v-for="(log, index) in logs" :key="index" class="mb-2">{{ log }}</li>
        </ul>
        <div class="flex justify-end gap-4">
          <button
              @click="handleConfirm"
              class="bg-primary-color text-white px-4 py-2 rounded duration-300 hover:bg-primary-color hover:text-white hover:shadow-md"
          >
            Confirm Save
          </button>
          <button
              @click="handleDiscard"
              class="bg-red-500 text-white px-4 py-2 rounded duration-300 hover:bg-red-700 hover:text-white hover:shadow-md"
          >
            Discard Changes
          </button>
        </div>
      </div>
      <!-- Display confirmation message if an action was made -->
      <div v-else>
        <h2 class="text-lg font-bold mb-4">{{ message }}</h2>
        <button
            @click="handleClose"
            :class="closeButtonClass"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  show: Boolean,
  logs: Array,
  isConfirmed: Boolean,
  message: String,
  lastAction: String
});

const emit = defineEmits(['confirm', 'discard', 'close']);

const handleConfirm = () => {
  emit('confirm');
};

const handleDiscard = () => {
  emit('discard');
};

const handleClose = () => {
  emit('close');
};

const closeButtonClass = computed(() => {
  return props.lastAction === "confirm"
      ? "bg-primary-color text-white px-4 py-2 rounded duration-300 hover:bg-primary-color hover:text-white hover:shadow-md mt-4"
      : "bg-red-500 text-white px-4 py-2 rounded duration-300 hover:bg-red-700 hover:text-white hover:shadow-md mt-4";
});
</script>

<style scoped>
</style>
