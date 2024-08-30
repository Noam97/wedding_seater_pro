<template>
  <div class="flex justify-around items-center gap-16 border border-purple-300 rounded-xl shadow-md px-6 py-2 w-full">
    <div class="flex items-center gap-3 h-[80px]">
      <img src="../assets/images/brideAndGroom.png" alt="wedding brideAndGroom" class="w-16 h-16" />
      <div class="flex flex-col">
        <span class="text-3xl">
          {{ brideCount + groomCount }}
        </span>
        <span class="text-xl">
          guest{{ brideCount + groomCount > 1 ? 's' : '' }}
        </span>
      </div>
      <div class="flex gap-4 items-center h-full">
        <div class="flex flex-col">
          <span class="text-lg font-medium">
            {{ brideCount }}
          </span>
          <span class="text-lg font-medium">
            {{ groomCount }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text">
            bride's side
          </span>
          <span class="text">
            groom's side
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 h-[80px]">
      <img src="../assets/images/letter.png" alt="wedding brideAndGroom" class="w-16 h-16" />
      <div class="flex flex-col">
        <span class="text-3xl">
          {{ invitations }}
        </span>
        <span class="text-xl">
          invitation{{invitations > 1 ? 's' : ''}}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3 h-[80px]">
      <img src="../assets/images/table.png" alt="wedding brideAndGroom" class="w-16 h-16" />
      <div class="flex gap-4 items-center h-full">
        <div class="flex flex-col">
          <span class="text=lg font-medium">
            {{ tablesCount }}
          </span>
          <span class="text=lg font-medium">
            {{ chairsCount }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xl">
            tables
          </span>
          <span class="text-xl">
            chairs
          </span>
        </div>
      </div>
    </div>

    <!--    <div class="flex items-center gap-3 h-[80px]">-->
    <!--      <div class="flex flex-col">-->
    <!--        <span class="text-lg">-->
    <!--          Export from excel-->
    <!--        </span>-->
    <!--        <span class="text-lg">-->
    <!--          Import to excel-->
    <!--        </span>-->
    <!--      </div>-->
    <!--    </div>-->

    <button
        @click="generateTables"
        class="duration-300 border-2 border-primary-color bg-primary-color text-white rounded-xl px-10 py-2 hover:shadow-md"
    >
      Generate tables
    </button>

  </div>
</template>

<script setup>
import {useRouter} from "vue-router";

defineProps({
  brideCount: {
    type: Number,
    default: 0,
    required: true
  },
  groomCount: {
    type: Number,
    default: 0,
    required: true
  },
  invitations: {
    type: Number,
    default: 0,
    required: true
  },
  chairsCount: {
    type: Number,
    default: 0,
    required: true
  },
  tablesCount: {
    type: Number,
    default: 0,
    required: true
  }
})
const router = useRouter();

async function generateTables() {
  router.push('/table')
}
</script>