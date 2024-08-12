<template>
  <div class="tooltip-container">
    <slot name= "content"></slot>
    <div class="tooltip" :class="position">
      <slot name="text"></slot>
      <div class="tooltip-arrow"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
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
  background-color: #fff;
  text-align: center;
  padding: 8px;
  border-radius: 30px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
  @apply shadow-md;
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
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 9px solid #fff; /* Adjust the arrow direction */
}

.tooltip-container:hover .tooltip-arrow {
  display: block;
}
</style>