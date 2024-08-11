<template>
  <div class="tooltip-container">
    <slot></slot>
    <div class="tooltip" :class="position">
      {{ text }}
      <div class="tooltip-arrow"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      default: 'bottom', // Set the default position to bottom
    },
  },
};
</script>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  top: 125%; /* Positioned below the element */
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 8px;
  border-radius: 4px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
}

.tooltip-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.tooltip-arrow {
  position: absolute;
  bottom: 100%; /* Positioned at the bottom of the tooltip */
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #333; /* Adjust the arrow direction */
}

.tooltip-container:hover .tooltip-arrow {
  display: block;
}
</style>