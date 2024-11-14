<template>
  <v-app>
    <v-app-bar color="yellow" elevation="0">
      <v-app-bar-title></v-app-bar-title>
      <v-spacer></v-spacer>
      <LoginForm></LoginForm>
      <RegisterFrom></RegisterFrom>
      <!-- <v-btn variant="outlined" color="red" @click="signup" rounded="0">회원가입</v-btn> -->
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script setup>
import LoginForm from './components/LoginForm.vue';
import RegisterFrom from './components/RegisterFrom.vue';
</script>
<style>
.v-btn {
  margin-right: 8px
}
</style>