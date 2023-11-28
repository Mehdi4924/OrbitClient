import {legacy_createStore as createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {persistStore} from 'redux-persist';
import persistedReducer from '../reducers/combined';
//Create A Store
export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
