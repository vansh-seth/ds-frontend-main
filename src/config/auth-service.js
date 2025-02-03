let accessToken = null;

export const setAuth = (authData) => {
  accessToken = authData.accessToken;
  localStorage.setItem("token", authData.refreshToken);
  localStorage.setItem("user", authData.username);
};

export const setStepStatus = (step) => {
  localStorage.setItem("currentStep", step);
};

export const getRefreshToken = () => {
  return localStorage.getItem("token");
};

export const getAccessToken = () => {
  return accessToken;
};

export const getUserDetails = () => {
  return {
    user: localStorage.getItem("user"),
  };
};

export const getCurrentStep = () => {
  return {
    step: localStorage.getItem("currentStep"),
  };
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const clearStepStatus = () => {
  localStorage.removeItem("currentStep");
};

export const setDuplicateStep = (step) => {
  localStorage.setItem("duplicateStep", step);
};

export const getDuplicateStep = () => {
  return {
    step: localStorage.getItem("duplicateStep"),
  };
};

export const clearDuplicateStep = () => {
  localStorage.removeItem("duplicateStep");
};
