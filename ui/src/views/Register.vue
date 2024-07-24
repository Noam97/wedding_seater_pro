<template>
  <div class="bg-img flex flex-col justify-center items-center w-screen h-screen bg-gray-100">
    <form
        class="flex flex-col justify-center items-center py-4 px-6 sm:px-10 rounded-lg shadow-lg backdrop-blur-sm bg-white/30 w-1/2"
        @submit.prevent="submit">
      <h1 class="text-4xl text-white uppercase tracking-tighter">
        Register
      </h1>

      <div
          class="flex flex-col lg:flex-row lg:flex-wrap justify-center my-4 gap-x-10 gap-y-8">
        <div class="relative flex flex-col w-full">
          <input
              @input="resetError"
              v-model="payload.firstName"
              placeholder="First Name"
              class="duration-300 border-2 py-1 px-2"
          />

          <transition name="slide-fade">
            <span v-if="v$.firstName.$error" class="error-msg">
              {{ v$.firstName.$errors[0].$message }}
              error email
            </span>
          </transition>
        </div>

        <div class="relative flex flex-col w-full">
          <input
              @input="resetError"
              v-model="payload.lastName"
              placeholder="Last Name"
              class="duration-300 border-2 py-1 px-2"
          />

          <transition name="slide-fade">
            <span v-if="v$.lastName.$error" class="error-msg">
              {{ v$.lastName.$errors[0].$message }}
              error email
            </span>
          </transition>
        </div>

        <div class="relative flex flex-col w-full">
          <input
              @input="resetError"
              v-model="payload.email"
              placeholder="Email"
              type="email"
              class="duration-300 border-2 py-1 px-2"
          />

          <transition name="slide-fade">
            <span v-if="v$.email.$error" class="error-msg">
              {{ v$.email.$errors[0].$message }}
              error email
            </span>
          </transition>
        </div>

        <div class="relative flex flex-col w-full">
          <input
              @input="resetError"
              v-model="payload.password"
              placeholder="Password"
              type="password"
              class="duration-300 border-2 py-1 px-2"
          />

          <transition name="slide-fade">
            <span v-if="v$.password.$error" class="error-msg">
              {{ v$.password.$errors[0].$message }}
              error email
            </span>
          </transition>
        </div>

        <div class="relative flex flex-col w-full">
          <input
              @input="resetError"
              v-model="payload.confirm"
              placeholder="Confirm Password"
              type="password"
              class="duration-300 border-2 py-1 px-2"
          />

          <transition name="slide-fade">
            <span v-if="v$.confirm.$error" class="error-msg">
              {{ v$.confirm.$errors[0].$message }}
              error email
            </span>
          </transition>
        </div>
      </div>

      <transition name="slide-fade">
        <div
            v-if="errors.length"
            class="error">
          {{ errors }}
        </div>
      </transition>

      <div class="flex xl:flex-row flex-col items-center mt-4 w-full">
        <button
            type="button"
            @click="router.push('/login')"
            class="absolute duration-300 tracking-wider text-primary-color text-xs py-1 px-3 whitespace-nowrap border-b-2 border-transparent hover:border-primary-color">
          Already have an account? <br>
          Login
        </button>
        <div class="flex justify-center items-center w-full">
          <button
              type="submit"
              class="duration-300 border-2 border-primary-color rounded-full tracking-wider text-primary-color py-2 px-5 hover:bg-primary-color hover:text-white">
            Register
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { email, helpers, required, sameAs } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { useStore } from "@/store/index.js";
import { useRouter } from "vue-router";

const store = useStore()
const router = useRouter()
const payload = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirm: ''
})
const rules = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  password: { required },
  confirm: { required,
    sameAsPassword: helpers.withMessage(
        'Make sure your passwords match',
        sameAs(computed(() => payload.value.password))
    )

  },
}
const errors = ref('')

const v$ = useVuelidate(rules, payload)

async function submit() {
  v$.value.$touch()
  if(v$.value.$invalid) {
    return
  }

  try {
    await store.createUser(payload.value)

    await router.push('/login')
  } catch (error) {
    errors.value = error.response.data.error
  }
}

function resetError() {
  errors.value = ''
}
</script>