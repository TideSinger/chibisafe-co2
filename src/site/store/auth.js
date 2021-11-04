const getDefaultState = () => ({
	loggedIn: false,
	user: {
		id: null,
		isAdmin: false,
		username: null
	},
	token: null
});

export const state = getDefaultState;

export const getters = {
	isLoggedIn: state => state.loggedIn,
	getApiKey: state => state.user?.apiKey,
	getToken: state => state.token
};

export const actions = {
	async verify({ commit, dispatch }) {
		try {
			const response = await this.$axios.$get('verify');
			commit('loginSuccess', response);
		} catch (e) {
			dispatch('alert/set', { text: e.message, error: true }, { root: true });
		}
	},
	async login({ commit }, { username, password }) {
		commit('loginRequest');

		const data = await this.$axios.$post('auth/login', { username, password });
		this.$axios.setToken(data.token, 'Bearer');

		commit('setToken', data.token);
		commit('loginSuccess', { token: data.token, user: data.user });
	},
	async register(_, { username, password }) {
		return this.$axios.$post('auth/register', {
			username,
			password
		});
	},
	async fetchCurrentUser({ commit, dispatch }) {
		try {
			const data = await this.$axios.$get('users/me');
			commit('setUser', data.user);
		} catch (e) {
			dispatch('alert/set', { text: e.message, error: true }, { root: true });
		}
	},
	async changePassword({ dispatch }, { password, newPassword }) {
		try {
			const response = await this.$axios.$post('user/password/change', {
				password,
				newPassword
			});

			return response;
		} catch (e) {
			dispatch('alert/set', { text: e.message, error: true }, { root: true });
		}

		return null;
	},
	async requestAPIKey({ commit, dispatch }) {
		try {
			const response = await this.$axios.$post('user/apikey/change');
			commit('setApiKey', response.apiKey);

			return response;
		} catch (e) {
			dispatch('alert/set', { text: e.message, error: true }, { root: true });
		}

		return null;
	},
	logout({ commit }) {
		commit('logout');
	}
};

export const mutations = {
	setToken(state, token) {
		state.token = token;
	},
	setApiKey(state, apiKey) {
		state.user.apiKey = apiKey;
	},
	setUser(state, user) {
		state.user = user;
	},
	loginRequest(state) {
		state.isLoading = true;
	},
	loginSuccess(state, { user }) {
		this.$cookies.set('token', state.token, { path: '/' });
		state.user = user;
		state.loggedIn = true;
		state.isLoading = false;
	},
	logout(state) {
		this.$cookies.remove('token', { path: '/' });
		// reset state to default
		Object.assign(state, getDefaultState());
	}
};
