<template>
  <div class="min-h-screen flex flex-col gap-6 items-center p-10">
    <h1 class="text-3xl text-blue-600 uppercase">
      Guest Management
    </h1>

    <card />

    <div class="flex justify-center gap-6">
      <button
          @click="openGuest"
          :class="openGuestCard ? 'bg-blue-700 text-blue-100' : 'border-blue-700 text-blue-700'"
          class="duration-300 border-2 rounded-xl px-10 py-2 hover:shadow-md"
      >
        Add a guest
      </button>

      <button
          @click="openTable"
          :class="openTableCard ? 'bg-blue-700 text-blue-100' : 'border-blue-700 text-blue-700'"
          class="duration-300 border-2 rounded-xl px-10 py-2 hover:shadow-md"
      >
        Add a table
      </button>

      <button
          @click="generateTables"
          class="duration-300 border-2 border-blue-700 bg-blue-700 text-blue-100 rounded-xl px-10 py-2 hover:shadow-md"
      >
        Generate tables
      </button>
    </div>

    <form
        v-if="openGuestCard"
        class="flex items-center gap-6 border-2 border-gray-200 py-4 px-6 sm:px-10 rounded-lg shadow-md w-full"
        @submit.prevent="addGuest"
    >
      <div class="relative flex flex-col w-full">
        <input
            @input="resetError"
            v-model="newGuest.name"
            placeholder="Name"
            type="text"
            class="duration-300 border-2 py-1 px-2 rounded-xl"
        />

        <transition name="slide-fade">
            <span v-if="v$.name.$error" class="error-msg">
              {{ v$.name.$errors[0].$message }}
            </span>
        </transition>
      </div>

      <div class="relative flex flex-col w-full">
        <input
            @input="resetError"
            v-model="newGuest.guestsCount"
            placeholder="Guest's count"
            type="number"
            class="duration-300 border-2 py-1 px-2 rounded-xl"
        />

        <transition name="slide-fade">
            <span v-if="v$.guestsCount.$error" class="error-msg">
              {{ v$.guestsCount.$errors[0].$message }}
            </span>
        </transition>
      </div>

      <div class="relative flex items-center gap-6 w-full">
        <h1> Side </h1>

        <button
            type="button"
            @click="newGuest.side = 'bride'"
            class="border border-blue-700 text-blue-700 px-4 py-1 rounded-xl"
            :class="newGuest.side === 'bride' ? 'bg-blue-700 !text-white' : ''"
        > Bride </button>

        <button
            type="button"
            @click="newGuest.side = 'groom'"
            class="border border-blue-700 text-blue-700 px-4 py-1 rounded-xl"
            :class="newGuest.side === 'groom' ? 'bg-blue-700 !text-white' : ''"
        > Groom </button>

        <transition name="slide-fade">
            <span v-if="v$.side.$error" class="error-msg">
              {{ v$.side.$errors[0].$message }}
            </span>
        </transition>
      </div>

      <div class="relative flex flex-col w-full">
        <select
            v-model="newGuest.closeness"
            class="duration-300 border-2 py-1 px-2 rounded-xl">
          <option disabled selected value="">
            Choose Closeness
          </option>
          <option
              v-for="item in closenessList"
              :key="item"
              :value="item.value">
            {{ item.name }}
          </option>
        </select>

        <transition name="slide-fade">
          <span v-if="v$.closeness.$error" class="error-msg">
            {{ v$.closeness.$errors[0].$message }}
          </span>
        </transition>
      </div>

      <transition name="slide-fade">
        <div
            v-if="error.length"
            class="error-msg">
          {{ error }}
        </div>
      </transition>

      <button
          type="submit"
          class="duration-300 border-2 border-blue-700 rounded-xl tracking-wider bg-blue-700 text-white py-2 px-5 hover:shadow-xl"
      >
        Add
      </button>
    </form>

    <form
        v-if="openTableCard"
        class="flex items-center gap-6 border-2 border-gray-200 py-6 px-6 sm:px-10 rounded-lg shadow-md w-full"
        @submit.prevent="addTable">
      <div class="relative flex flex-col w-full">
        <input
            @input="resetError"
            v-model="newTable.name"
            placeholder="Table's Name"
            type="text"
            class="duration-300 border-2 py-1 px-2 rounded-xl"
        />

        <transition name="slide-fade">
            <span v-if="v$2.name.$error" class="error-msg">
              {{ v$2.name.$errors[0].$message }}
            </span>
        </transition>
      </div>

      <div class="relative flex flex-col w-full">
        <input
            @input="resetError"
            v-model="newTable.placesCount"
            placeholder="Guest's count"
            type="number"
            class="duration-300 border-2 py-1 px-2 rounded-xl"
        />

        <transition name="slide-fade">
            <span v-if="v$2.placesCount.$error" class="error-msg">
              {{ v$2.placesCount.$errors[0].$message }}
            </span>
        </transition>
      </div>

      <transition name="slide-fade">
        <div
            v-if="error.length"
            class="error-msg">
          {{ error }}
        </div>
      </transition>

      <button
          type="submit"
          class="duration-300 border-2 border-blue-700 rounded-xl tracking-wider bg-blue-700 text-white py-2 px-5 hover:shadow-xl"
      >
        Add
      </button>
    </form>

    <guest-table :titles="titles" :contents="contents" />
  </div>
</template>

<script setup>
import Card from "@/components/Card.vue";
import GuestTable from "@/components/GuestTable.vue";
import { ref } from "vue";
import {helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import {useStore} from "@/store/index.js";

const store = useStore()
const openTableCard = ref(false)
const openGuestCard = ref(false)
const newGuest = ref({
  name: '',
  guestsCount: '',
  side: '',
  closeness: '',
})
const newTable = ref({
  name: '',
  placesCount: '',
})
const closenessList = ref([
  {
    value: 'close_family',
    name: 'Close Family'
  }, {
    value: 'distant_family',
    name: 'Distant family'
  }, {
    value: 'friends',
    name: 'Friends'
  }, {
    value: 'co-workers',
    name: 'Co-workers'
  }, {
    value: "parents_guests",
    name: "Parents' guests"
  }
])
const titles = ref(['Name', "Guest's count", 'Side', 'Closeness', 'Table Number'])
const contents = ref([])
const error = ref('')
const rules = {
  name: { required },
  guestsCount: {
    required,
    minValue: helpers.withMessage(
        "The minimum is 0",
        helpers.withAsync((value) => value > 0)
    )
  },
  side: { required },
  closeness: { required },
}
const rules2 = {
  name: { required },
  placesCount: {
    required,
    minValue: helpers.withMessage(
        "The minimum is 0",
        helpers.withAsync((value) => value > 0)
    )
  },
}
const v$ = useVuelidate(rules, newGuest)
const v$2 = useVuelidate(rules2, newTable)

getGuests()
async function addGuest() {
  v$.value.$touch()
  if(v$.value.$invalid) {
    return
  }

  try {
    const response = await store.createGuest(newGuest.value)

    let closenessName = ''
    closenessList.value.forEach(closeness => {
      if(closeness.value === response.data.closeness)
        closenessName = closeness.name
    })
    contents.value.unshift([
      response.data.name,
      response.data.count,
      response.data.side,
      closenessName,
      'NaN',
    ])

    newGuest.value.closeness = ''
    newGuest.value.name = ''
    newGuest.value.guestsCount = ''
    newGuest.value.side = ''

    resetAllErrors()
  } catch (err) {
    error.value = err.response.data.error
  }
}
async function getGuests() {
  try {
    const response = await store.getGuests()

    response.data.map(item => {
      let closenessName = ''
      closenessList.value.forEach(closeness => {
        if(closeness.value === item.closeness)
          closenessName = closeness.name
      })
      contents.value.push([
        item.name,
        item.count,
        item.side,
        closenessName,
        'NaN',
      ])
    })
  } catch (error) {
    console.log(error)
  }
}
function openGuest() {
  openTableCard.value = false
  openGuestCard.value = !openGuestCard.value
}
function  openTable() {
  openGuestCard.value = false
  openTableCard.value = !openTableCard.value
}
async function addTable() {
  v$2.value.$touch()
  if(v$2.value.$invalid) {
    return
  }

  try {
    await store.createTable(newTable.value)

    newTable.value.placesCount = ''
    newTable.value.name = ''

    resetAllErrors()
  } catch (err) {
    error.value = err.response.data.error
  }
}
async function generateTables() {
  try {
    await store.generateTables()
  } catch (error) {
    console.log(error)
  }
}
function resetError() {
  error.value = ''
}
function resetAllErrors() {
  v$.value.$reset()
  v$2.value.$reset()
  resetError()
}
</script>