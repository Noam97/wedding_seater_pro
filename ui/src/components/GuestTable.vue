<template>
  <table class="min-w-full">
    <thead>
    <tr class="border-b-2 border-primary-color">
      <th
          v-for="(title, index) in titles"
          :key="index"
          scope="col"
          class="py-3.5 px-3 text-left text-sm font-bold text-primary-color"
      >
        {{ title }}
      </th>
    </tr>
    </thead>

    <tbody class="divide-y">
    <tr v-for="content in contents" :key="content.id">
      <td
          v-for="(col, index) in content"
          :key="index"
          class="whitespace-nowrap px-3 py-5 text-sm"
      >
        <div class="text-gray-900">
          {{ col }}
        </div>
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
</script>