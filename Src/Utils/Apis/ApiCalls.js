import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {instance} from './instance';

export const configureAxiosHeaders = async () => {
  let tok = await AsyncStorage.getItem('AuthToken');
  console.log(tok, 'token');
  axios.defaults.headers['Authorization'] = 'Bearer ' + tok;
  axios.defaults.headers['Expires'] = '250';
  axios.defaults.headers['Pragma'] = 'no-cache';
  axios.defaults.headers['Cache-Control'] = 'no-cache';
};
const requests = {
  post: (url, body) => axios.post(`${instance}${url}`, body, {timeout: 200000}),
  put: (url, body) => axios.put(`${instance}${url}`, body, {timeout: 200000}),
  get: url => axios.get(`${instance}${url}`, {timeout: 200000}),
  delete: url => axios.delete(`${instance}${url}`),
};

export const AuthApi = {
  login: body => requests.post('Account/Login', body),
};
export const AttendenceApi = {
  attandenceReport: body => requests.post('Attendence/get', body),
};
export const leaveApi = {
  applyLeaave: body => requests.post('Leave/Apply', body),
  reasonLeave: id => requests.get(`Leave/LeaveReasons?EmployeeId=${id}`),
  leaveHistory: id =>
    requests.get(`Leave/PreviousLeaveHistory?EmployeeId=${id}`),
};
export const members = {
  getAllMembers: id => requests.get(`Employee/GetTeamMembers?EmployeeId=${id}`),
  memberHistory: id =>
    requests.get(
      `Employee/GetCurrentMonthAttendenceOfTeamMembers?EmployeeId=${id}`,
    ),
  approveMemberLeave: body => requests.post('Employee/Approve', body),
  createMemberPerformance: body =>
    requests.post('Employee/CreateMemberPerformance', body),
  getMemberPerformance: id =>
    requests.get(`Employee/GetEmployeePerformance?EmployeeId=${id}`),
  reject: body => requests.post('Employee/Reject', body),
  getChattedUsers: () => requests.get('Chats/GetHrChats'),
  getLoanTypes: () => requests.get(`Employee/DeductionTypes`),
  applyForLoan: data => requests.post(`Employee/ApplyForLoan`, data),
  getLoanHistory: id =>
    requests.get(`Employee/GetLoanHistory?EmployeeId=${id}`),
  evaluationParams: () => requests.get('EvaluationParameters/Get'),
  createEvaluation: body => requests.post('EvaluationReport/Create', body),
  getAllLeaveRequests: () => requests.get('LEave/FetchPendingRequests'),
  getNotificationTypes: () => requests.get('Notification/GetNotificationTypes'),
  getNotifications: data => requests.post('Notification/get', data),
};
export const PayRoll = {
  getPayRoll: (id, month, year) =>
    requests.get(
      `Employee/GeneratePayRoll?EmployeeId=${id}&MonthNo=${month}&YearNo=${year}`,
    ),
};
export const chats = {
  getallChats: () => requests.get('Chats/GetHrChats'),
  getSingleChat: body => requests.post('Chats/GetChats', body),
  sendMessage: body => requests.post('Chats/Create', body),
};

const config = {
  headers: {
    Authorization:
      'key=AAAATGMg3r4:APA91bHg5LrRERKPpC8mYHK6K1Gj9sPj7AIJ_vtgcX5OxxYk2zTO_Y9OJSmT6fW7b467nYktm5l95KUjUmuatI3tU6AqWKzls8KFKPOn3PRXWWef-CeHNpawGfiWgiDI21_IhnlbL6we',
  },
};
export const sendNotification = {
  sendNotificationToAll: data =>
    axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        ...data,
        apns: {
          headers: {
            'apns-expiration': '1604750400',
          },
        },

        android: {
          ttl: '2s',
        },
        webpush: {
          headers: {
            TTL: '4500',
          },
        },
      },
      config,
    ),
};
