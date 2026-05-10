export const login = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};