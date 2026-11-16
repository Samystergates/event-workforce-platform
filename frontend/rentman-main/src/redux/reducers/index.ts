"use client"
import { combineReducers } from "@reduxjs/toolkit";
import skillReducer from '@/redux/reducers/skillReducers';
import eventReducers from "@/redux/reducers/eventReducers";
import userReducers from "@/redux/reducers/userReducers";

const reducer = combineReducers({
    skills: skillReducer,
    events: eventReducers,
    user: userReducers
});

export default reducer;
