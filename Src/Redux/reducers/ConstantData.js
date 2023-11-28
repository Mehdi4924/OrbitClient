import * as ActionTypes from '../actions/ActionTypes';
// Create Reducer :- Reducer is responsible for taking actions, making state modifications

let initialState = {
  dashboardData: {},
};
const ConstantData = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.DASHBOARDDATA:
      return {
        ...state,
        dashboardData: action.payload.data,
      };
    case ActionTypes.CLEARDASHBOARDDATA:
      return {
        ...state,
        dashboardData: {},
      };
    default:
      return state;
  }
};

export default ConstantData;
