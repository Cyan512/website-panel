const environmentDev = {
  production: false,
  version: 'DEV',

  app:{
    apiEndpoint: import.meta.env.VITE_API_URL
  },
};

export default environmentDev;