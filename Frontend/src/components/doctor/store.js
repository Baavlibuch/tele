import { configureStore } from '@reduxjs/toolkit';
import doctorAuthReducer from './features/doctorSlice';

export default configureStore({
    reducer:{
        doctor: doctorAuthReducer, 
    }
});