<template>
    <v-container>
      <v-form @submit.prevent="login">
        <v-text-field v-model="id" label="Id" required></v-text-field>
        <v-text-field v-model="password" label="Password" type="password" required></v-text-field>
        <v-btn type="submit">Login</v-btn>
      </v-form>
    </v-container>
  </template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const id = ref('');
const password = ref('');

const login = async () => {
    axios.post('')
}
</script>