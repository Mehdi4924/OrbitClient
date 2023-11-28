import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';
import ConstantData from './ConstantData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['dashboardData'],
  timeout: null,
};

const combinedReducers = combineReducers({
  ConstantData,
});
const persistedReducer = persistReducer(persistConfig, combinedReducers);

export default persistedReducer;
