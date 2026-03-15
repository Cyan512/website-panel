import environmentDev from './environment.dev';
import environmentProd from './environment.prod';

const environment =
    import.meta.env.MODE === 'production'
        ? environmentProd
        : environmentDev;

export default environment;