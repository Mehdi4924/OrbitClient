import jwtDecode from 'jwt-decode';
import {store} from '../Redux/Store/index';
const TokenService = {
  isTokenExpired: token => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  },
};

export default TokenService;
