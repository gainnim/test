import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = true;
    },
    LOGOUT(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  actions: {
    login({ commit }, user) {
      commit('SET_USER', user);
    },
    logout({ commit }) {
      commit('LOGOUT');
    },
  }
})
