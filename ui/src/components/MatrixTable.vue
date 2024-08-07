<template>
  <table class="table-fixed w-full">
    <thead>
    <tr class="border-b-2 border-primary-color">
      <th
          v-for="(title, index) in titles"
          :key="index"
          scope="col"
          class="py-3.5 px-3 text-center text-xl font-bold text-primary-color"
      >
        {{ title }}
      </th>
      <th></th>
    </tr>
    </thead>

    <tbody class="divide-y">
    <tr v-for="content in contents" :key="content.id">
      <td
          v-for="(col, index) in content"
          :key="index"
          :class="typeof col === 'object'  ? 'hidden' : '' "
          class=" text-center text-lg whitespace-nowrap px-3 py-5 font-semibold"
      >
        <div class="text-gray-900">
          {{ col }}
        </div>
      </td>
<!--      <td>-->
<!--       <button  @click="$emit('edit', content)" > <img  src="../assets/images/edit.jpg" alt="Edit" class="w-6 h-6" />-->
<!--       </button>-->
<!--      </td>-->
      <td
          class=" text-center text-lg whitespace-nowrap px-3 py-5 font-semibold"
      >
        <button @click="$emit('delete', content)" > <img src="../assets/images/delete.jpg" alt="Delete"  class="w-6 h-6" />
        </button>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  titles: {
    type: Array,
    required: true,
  },
  contents: {
    type: Array,
    required: true,
  },
})
defineEmits(['edit', 'delete'])

</script>