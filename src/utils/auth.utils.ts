export const AuthStorage = {
  getToken: () => localStorage.getItem("token"),

  setToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  removeToken: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};
