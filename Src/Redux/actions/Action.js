// Create Actions :- Actions describe what you are going to do, what do you want to do. It's just a simple function that returns a object
import * as ActionTypes from './ActionTypes';
export function setDashboardData(data) {
  return {
    type: ActionTypes.DASHBOARDDATA,
    payload: {
      data,
    },
  };
}
export function clearDashboardData() {
  return {
    type: ActionTypes.CLEARDASHBOARDDATA,
  };
}
