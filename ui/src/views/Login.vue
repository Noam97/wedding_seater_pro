In client side -> views/login.vue:
<template>
  <div class="bg-img flex flex-col justify-center items-center w-screen h-screen bg-gray-100">
    <form
        class="flex flex-col justify-center items-center py-4 px-6 sm:px-10 rounded-lg shadow-lg backdrop-blur-sm bg-white/30"
        @submit.prevent="submit">
      <h1 class="text-4xl text-white uppercase tracking-tighter">
        Login
      </h1>
      <div
          class="flex flex-col lg:flex-row lg:flex-wrap justify-center my-4 gap-x-10 gap-y-4">
        <div class="flex flex-col w-full">
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

        <div class="flex flex-col w-full">
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
      </div>

      <transition name="slide-fade">
        <div
            v-if="error.length"
            class="error-msg">
          {{ error }}
        </div>
      </transition>

      <div class="flex flex-col items-center mt-4 w-full">
        <button
            type="submit"
            class="duration-300 border-2 border-primary-color rounded-full tracking-wider bg-primary-color text-white py-2 px-5 hover:shadow-xl">
          Send
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { email, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { useStore } from "@/store/index.js";

const store = useStore()
const router = useRouter()
const error = ref('')
const payload = ref({
  email: '',
  password: '',
})
const rules = {
  email: { required, email },
  password: { required },
}

const v$ = useVuelidate(rules, payload)

async function submit() {
  v$.value.$touch()
  if(v$.value.$invalid) {
    return
  }

  try {
    const response = await store.login(payload.value)
    store.saveUserInLocalStorage(response.data)
    await router.push('/')
  } catch (err) {
    error.value = err.response.data.error
  }
}

function resetError() {
  error.value = ''
}
</script>