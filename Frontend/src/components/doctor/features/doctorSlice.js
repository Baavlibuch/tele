import { createSlice } from "@reduxjs/toolkit";

const doctorAuthSlice = createSlice({
    name: "doctor",
    initialState: {
        doctor:JSON.parse(localStorage.getItem('doctor')) || null,
        loading: false,
        error: null,
    },
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loggedIn = true;
            state.doctor = action.payload;
            state.loading = false;
            state.error = null;
            localStorage.setItem('doctor', JSON.stringify(action.payload))
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.doctor = "";
            state.loading = false;
            state.error = null;
            localStorage.removeItem('doctor');
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = doctorAuthSlice.actions;

export default doctorAuthSlice.reducer;