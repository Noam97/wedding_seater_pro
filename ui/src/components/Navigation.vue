<template>
  <nav class="absolute top-0 flex flex-row-reverse w-full py-2 px-10">
    <button
        @click="logout"
        class="duration-300 border-2 border-primary-color rounded-full tracking-wider text-primary-color py-2 px-5 hover:bg-primary-color hover:text-white">
      Logout
    </button>
  </nav>
</template>

<script setup>
import {useStore} from "@/store/index.js";
import {useRouter} from "vue-router";

const store = useStore()
const router = useRouter()
function logout() {
  store.logout()
  router.push('/login')
}
</script>