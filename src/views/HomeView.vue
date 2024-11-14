<template>
  <v-container>
    <div v-if="!isAuthenticated">
      <h2>로그인하세요</h2>
    
    </div>
    <div v-else>
      <h2>환영합니다, {{ user.name }}님!</h2>
    </div>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

// Vuex 상태를 가져오기 위한 computed 사용
const user = computed(() => store.state.user);
const isAuthenticated = computed(() => store.state.isAuthenticated);
</script>

<style scoped>
</style>
