<template>
  <div class="table-container">
    <div class="flex flex-wrap justify-center items-center h-full gap-x-2">
      <div v-for="(person, peopleIndex) in people" :key="`person_${peopleIndex}`" class="text-xs border border-primary-color bg-primary-color text-gray-300 rounded-xl px-2 py-1">
        ({{ person.count }}) {{ person.name }}
      </div>
    </div>
    <div class="chair" :class="index < guestsCount ? 'active' : 'no-active'" v-for="(chair, index) in chairs" :key="`chair_${index}`" :style="getChairStyle(index)" />
  </div>
</template>

<script setup>
const props = defineProps({
  guestsCount: {
    type: Number,
    default: 0,
    required: true
  },
  chairs: {
    type: Number,
    default: 0,
    required: true
  },
  people: {
    type: Array,
    default: [],
    required: true
  }
})

function getChairStyle(index) {
  const radius = 105;
  const angle = (2 * Math.PI) / props.chairs * index;
  const x = Math.cos(angle) * radius + 105;
  const y = Math.sin(angle) * radius + 105;
  return {
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)'
  };
}
</script>

<style scoped>
.table-container {
  position: relative;
  width: 210px;
  height: 210px;

  @apply bg-gray-200 rounded-full border-2 border-gray-700;
}
.chair {
  position: absolute;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: -1;

  @apply bg-gray-400 rounded-full border border-gray-700;
}

.active {
  background: var(--primary-color);
}

.controls {
  margin-top: 20px;
}
</style>