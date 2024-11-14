<template>
    <v-btn @click="showLoginModal = true" variant="outlined" color="red" rounded="0">회원가입</v-btn>

    <v-dialog v-model="showLoginModal" persistent max-width="400px">
      <v-card>
        <v-card-title class="headline">로그인</v-card-title>

        <v-card-text>
          <v-form @submit.prevent="login">
            <v-text-field v-model="id" label="Id" required></v-text-field>
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="login">Login</v-btn>
          <v-btn text @click="showLoginModal = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex'

const showLoginModal = ref(false);
const store = useStore();

const id = ref('');
const password = ref('');

const login = async () => {
  try {
    const response = await axios.post('/api/login', {
      id: id.value,
      password: password.value,
    });
    
    if (response.data.success) {
      // 로그인 성공 시, Vuex 상태에 사용자 정보 저장
      store.dispatch('login', response.data.user);
      showLoginModal.value = false; // 모달 닫기
    } else {
      alert('Login failed');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred during login');
  }
};
</script>
