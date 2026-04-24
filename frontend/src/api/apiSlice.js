import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api', // TODO: change to env variable later
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Attendance', 'Overtime', 'Report'],
  endpoints: (builder) => ({

    login: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),


    // 1.  'register' endpoint 
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register', // Check karein aapka backend URL yahi hai na
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = apiSlice;