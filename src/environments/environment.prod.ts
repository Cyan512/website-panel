const environmentProd = {
  production: true,
  version: 'PROD',

  app:{
    apiEndpoint: import.meta.env.VITE_API_URL
  },
};

export default environmentProd;