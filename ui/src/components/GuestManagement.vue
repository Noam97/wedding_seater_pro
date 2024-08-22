<template>
  <div class="min-h-screen flex flex-col gap-6 items-center p-10">
    <h1 class="text-4xl text-primary-color ">
      Guest & Table Management
    </h1>

    <Card :bride-count="countFromBride" :groom-count="countFromGroom" :invitations="invitations" :tables-count="tablesCount" :chairs-count="chairsCount" />

    <div class="flex justify-center gap-6">
      <button
          @click="openGuest"
          :class="openGuestCard ? 'bg-primary-color text-white' : 'text-primary-color'"
          class="duration-300 border-2 border-primary-color  rounded-xl px-10 py-2 hover:shadow-md"
      >
        Add a guest
      </button>

      <button
          @click="openTable"
          :class="openTableCard ? 'bg-primary-color text-white' : 'text-primary-color'"
          class="duration-300 border-2 border-primary-color  rounded-xl px-10 py-2 hover:shadow-md"
      >
        Add a table
      </button>
    </div>

    <form
        v-if="openGuestCard"
        class=" flex items-center gap-6 border border-purple-300 py-6 px-6 sm:px-10 rounded-lg shadow-md w-full"
        @submit.prevent="addGuest"
    >
      <div class="relative flex flex-col w-full">
        <input
            @input="resetError"
            v-model="newGuest.name"
            placeholder="Name"
            type="text"
            class="input"
        />

        <transition name="slide-fade">
            <span v-if="v$.name.$error" class="error-msg">
              {{ v$.name.$errors[0]?.$message }}
            </span>
        </transition>
      </div>

      <div class="relative flex flex-col w-full">
        <input
            @input="resetError"
            v-model="newGuest.guestsCount"
            placeholder="Guest count"
            type="number"
            class="input"
            min="1"
        />

        <transition name="slide-fade">
            <span v-if="v$.guestsCount.$error" class="error-msg">
              {{ v$.guestsCount.$errors[0]?.$message }}
            </span>
        </transition>
      </div>

      <div class="relative flex items-center gap-6 w-full">
        <h1> Side </h1>

        <button
            type="button"
            @click="newGuest.side = 'bride'"
            class="duration-300 border-2 border-primary-color text-primary-color px-4 py-1 rounded-xl"
            :class="newGuest.side === 'bride' ? 'bg-primary-color !text-white' : ''"
        > Bride </button>

        <button
            type="button"
            @click="newGuest.side = 'groom'"
            class="duration-300 border-2 border-primary-color text-primary-color px-4 py-1 rounded-xl"
            :class="newGuest.side === 'groom' ? 'bg-primary-color !text-white' : ''"
        > Groom </button>

        <transition name="slide-fade">
            <span v-if="v$.side.$error" class="error-msg">
              {{ v$.side.$errors[0]?.$message }}
            </span>
        </transition>
      </div>

      <div class="relative flex flex-col w-full">
        <select
            v-model="newGuest.closeness"
            class="duration-300 border-2 border-primary-color py-1 px-2 rounded-xl">
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
            {{ v$.closeness.$errors[0]?.$message }}
          </span>
        </transition>
      </div>

      <div class="relative">
        <button
            type="submit"
            class="duration-300 border-2 border-primary-color rounded-xl tracking-wider bg-primary-color text-white py-2 px-5 hover:shadow-xl"
        >
          Add
        </button>
        <transition name="slide-fade">
          <div
              v-if="error.length"
              class="error-msg whitespace-nowrap right-0"
          >
            {{ error }}
          </div>
        </transition>
      </div>
    </form>

    <form
        v-if="openTableCard"
        class="flex items-center gap-6 border border-purple-300 py-6 px-6 sm:px-10 rounded-lg shadow-md w-full"
        @submit.prevent="addTable">
      <div class="relative flex flex-col w-full">
        <input
            @input="resetError"
            v-model="newTable.tableNumber"
            placeholder="Table Number"
            type="number"
            class="input"
            min = 1
        />

        <transition name="slide-fade">
            <span v-if="v$2.tableNumber.$error" class="error-msg">
              {{ v$2.tableNumber.$errors[0]?.$message }}
            </span>
          <span v-else-if="uniqueError.length" class="error-msg">
            {{uniqueError}}
            </span>
        </transition>
      </div>

      <div class="relative flex flex-col w-full">
        <input
            @input="resetError"
            v-model="newTable.placesCount"
            placeholder="Guest count"
            type="number"
            class="input"
            min="5"
            max="20"
        />

        <transition name="slide-fade">
            <span v-if="v$2.placesCount.$error" class="error-msg">
              {{ v$2.placesCount.$errors[0]?.$message }}
            </span>
        </transition>
      </div>

      <div class="relative">
        <button
            type="submit"
            class="duration-300 border-2 border-primary-color rounded-xl tracking-wider bg-primary-color text-white py-2 px-5 hover:shadow-xl"
        >
          Add
        </button>
        <transition name="slide-fade">
          <div
              v-if="error.length"
              class="error-msg whitespace-nowrap right-0"
          >
            {{ error }}
          </div>
        </transition>
      </div>
    </form>

    <div class="w-3/4">
      <matrix-table v-if="openTableCard" :titles="tablesTableTitles" :contents="tablesTableContents" @edit="editTable"
                    @delete="deleteTable"  />
      <matrix-table v-else :titles="guestsTableTitles" :contents="guestsTableContents" @edit="editGuest"
                    @delete="deleteGuest" />
    </div>

  </div>
</template>

<script setup>
import Card from "@/components/Card.vue";
import { ref } from "vue";
import {helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import {useStore} from "@/store/index.js";
import MatrixTable from "@/components/MatrixTable.vue";

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
  tableNumber: '',
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
  },
  {
    value: "other",
    name: "Other"
  }
])

const guestsTableTitles = ref(['Name', "Guest Count", 'Side', 'Closeness', 'Actions'])
const guestsTableContents = ref([])
const error = ref('')
const guest_rules = {
  name: { required },
  guestsCount: {
    required,
    minValue: helpers.withMessage(
        "The minimum is 0",
        helpers.withAsync((value) => value >= 0)
    )
  },
  side: { required },
  closeness: { required },
}
const tablesTableTitles = ref(['Table Number', 'Guest Count', 'Actions'])
const tablesTableContents = ref([])
const table_rules = {
  tableNumber: { required },
  placesCount: {
    required,
    minValue: helpers.withMessage(
        "The minimum is 5",
        helpers.withAsync((value) => value >= 5)
    )
  },
}
const v$ = useVuelidate(guest_rules, newGuest)
const v$2 = useVuelidate(table_rules, newTable)
const countFromBride = ref(0)
const countFromGroom = ref(0)
const invitations = ref(0)
const tablesCount = ref(0)
const chairsCount = ref(0)
const uniqueError = ref('')

getGuests()
getTables()

async function addGuest() {
  v$.value.$touch()
  if(v$.value.$invalid) {
    return
  }

  try {
    const response = await store.createGuest(newGuest.value)
    store.removeStateFromLocalStorage()

    let closenessName = ''
    closenessList.value.forEach(closeness => {
      if(closeness.value === response.data.closeness)
        closenessName = closeness.name
    })
    guestsTableContents.value.unshift([
      response.data.name,
      response.data.count,
      response.data.side,
      closenessName,
      { id: response.data.id }
    ])
    if(response.data.side === 'bride')
      countFromBride.value += response.data.count
    else countFromGroom.value += response.data.count
    invitations.value++

    newGuest.value.closeness = ''
    newGuest.value.name = ''
    newGuest.value.guestsCount = ''
    newGuest.value.side = ''

    resetAllErrors()
  } catch (err) {
    error.value = err.response.data.error
    console.log(err.response.data.error, error.value)
  }
}
async function getGuests() {
  try {
    const response = await store.getGuests()

    response.data.forEach(item => {
      let closenessName = ''
      closenessList.value.forEach(closeness => {
        if(closeness.value === item.closeness)
          closenessName = closeness.name
      })
      guestsTableContents.value.push([
        item.name,
        item.count,
        item.side,
        closenessName,
        {id: item.id}
      ])

      if(item.side === 'bride')
        countFromBride.value += item.count
      else countFromGroom.value += item.count
    })
    invitations.value = response.data.length
  } catch (error) {
    console.log(error)
  }
}
async function editGuest(guest){
  store.removeStateFromLocalStorage()
  console.log(guest)
}

async function deleteGuest(guest) {
  try {
    const idObject = guest.find((element => typeof element === 'object'))
    await store.deleteGuest(idObject.id)
    guestsTableContents.value = guestsTableContents.value.filter(item => {
      const itemIdObject =  item.find((element => typeof element === 'object'))
      console.log(itemIdObject, idObject)
      if (itemIdObject.id !== idObject.id) {
        return true;
      } else {
        if (item[2] === 'bride') {
          countFromBride.value -= item[1];
        } else {
          countFromGroom.value -= item[1];
          countFromBride.value =  countFromBride.value
        }
        return false;
      }
    });

    const response = await store.getGuests();
    invitations.value = response.data.length;
    store.removeStateFromLocalStorage()


  } catch (error) {
    console.log(error);
  }
}

async function getTables() {
  try {
    const response = await store.getTables()
    let totalChairs = 0;
    response.data.forEach((item) => {
      tablesTableContents.value.push([item.table_number, item.places_count])
      totalChairs += parseInt(item.places_count)
    })
    tablesCount.value = response.data.length
    chairsCount.value = totalChairs
  } catch (error) {
    console.log(error);
  }
}

function openGuest() {
  resetAllErrors()
  openTableCard.value = false
  openGuestCard.value = !openGuestCard.value

  newGuest.value.closeness = ''
  newGuest.value.name = ''
  newGuest.value.guestsCount = ''
  newGuest.value.side = ''
}
function openTable() {
  resetAllErrors()
  openGuestCard.value = false
  openTableCard.value = !openTableCard.value

  newTable.value.placesCount = ''
  newTable.value.name = ''
}
async function addTable() {
  v$2.value.$touch()
  if(v$2.value.$invalid) {
    return
  }

  try {
    await store.createTable(newTable.value)
    tablesTableContents.value.push([
      newTable.value.tableNumber,
      newTable.value.placesCount,
    ])
    chairsCount.value += parseInt(newTable.value.placesCount)
    tablesCount.value ++

    newTable.value.tableNumber = ''
    newTable.value.placesCount = ''
    store.removeStateFromLocalStorage()

    resetAllErrors()
  } catch (err) {
    if (err.response.status === 422)
      uniqueError.value = err.response.data.error
    else
      error.value = err.response.data.error
  }
}
function editTable(table){
  console.log(table)
}
async function deleteTable(table){
  try {
    await store.deleteTable(table[0])
    tablesTableContents.value = tablesTableContents.value.filter(item => {
      if (item[0] !== table[0]) {
        return true
      } else {
        chairsCount.value -= item[1]
        tablesCount.value--
      }
    })
    store.removeStateFromLocalStorage()
  }
  catch (error) {
    console.log(error)
  }
}

function resetError() {
  error.value = ''
  uniqueError.value = ''
}
function resetAllErrors() {
  v$.value.$reset()
  v$2.value.$reset()
  resetError()
}
</script>