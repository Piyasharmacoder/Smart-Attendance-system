import { apiSlice } from './apiSlice';

export const overtimeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 Request OT
    requestOvertime: builder.mutation({
      query: (data) => ({
        url: '/overtime/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Overtime'],
    }),

    // 🔹 Get OT
    getOvertimeRequests: builder.query({
      query: () => '/overtime',
      providesTags: ['Overtime'],
    }),

    // 🔹 Update OT
    updateOvertimeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/overtime/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Overtime'],
    }),

  }),
});

export const {
  useRequestOvertimeMutation,
  useGetOvertimeRequestsQuery,
  useUpdateOvertimeStatusMutation,
} = overtimeApi;