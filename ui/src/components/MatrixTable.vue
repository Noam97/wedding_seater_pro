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
    <tr v-for="(content, rowIndex) in contents" :key="content.id">
      <td
          v-for="(col, colIndex) in content"
          :key="colIndex"
          :class="typeof col === 'object' ? 'hidden' : ''"
          class="text-center text-lg whitespace-nowrap px-3 py-5 font-semibold"
      >
          <input
              v-if="colIndex !== 2 && colIndex !== 3 && editIndex === rowIndex"
              v-model="editableContent[adjustmentTitles(titles[colIndex])]"
              class="input w-full"
              :type="adjustmentTitles(titles[colIndex])==='name' ? 'text' : 'number'"
          />
        <div v-else class="text-gray-900">
          {{ col }}
        </div>
      </td>
      <td class="text-center text-lg whitespace-nowrap px-3 py-5 font-semibold">
        <button v-if="editIndex === rowIndex" @click="saveEdit(rowIndex)" class="mr-2">
          <img src="../assets/images/vi.png" alt="Save" class="w-6 h-6" />
        </button>
        <button v-else @click="startEdit(rowIndex, content)" class="mr-2">
          <img src="../assets/images/edit.jpg" alt="Edit" class="w-6 h-6" />
        </button>
        <button @click="$emit('delete', content)">
          <img src="../assets/images/delete.jpg" alt="Delete" class="w-6 h-6" />
        </button>
<!--        <button @click="$emit('edit', content)">-->
<!--          <img src="../assets/images/edit.jpg" alt="Edit" class="w-6 h-6" />-->
<!--        </button>-->
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from '@/store';

const props = defineProps({
  titles: {
    type: Array,
    required: true,
  },
  contents: {
    type: Array,
    required: true,
  },
});
defineEmits(['edit', 'delete']);

const editIndex = ref(null);
const editableContent = ref({
  name: '',
  guestCount: 0
});
const store = useStore();

function adjustmentTitles(str){
  const string = str.split(' ').join('')
  return string.charAt(0).toLowerCase() + string.slice(1)
}

const startEdit = (index, content) => {
  editIndex.value = index;
  editableContent.value.name  =  content[0],
  editableContent.value.guestCount  =  content[1].toString()
  console.log("content[1]", content[1])
};

const saveEdit = async (index) => {
  const updatedContent = editableContent.value;

  console.log('All contents:', props.contents);
  console.log('Content at index:', props.contents[index]);

  const idObject = props.contents[index].find(element => typeof element === 'object');
  const guestId = idObject?.id;

  if (!guestId) {
    console.error('Guest ID is undefined or missing');
    return;
  }

  if (typeof updatedContent.guestCount === 'string') {
    updatedContent.guestCount = parseInt(updatedContent.guestCount, 10);
  }

  if (isNaN(updatedContent.guestCount)) {
    console.error('Count value is not a valid number');
    return;
  }

  try {
   await store.updateGuest(guestId, updatedContent);
    props.contents[index][0] = updatedContent.name;
    props.contents[index][1] = updatedContent.guestCount;
  } catch (error) {
    console.error('Failed to save the changes:', error);
  }

  editIndex.value = null;
};
</script>
