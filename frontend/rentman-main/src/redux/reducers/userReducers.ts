import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IUserProfile} from "@/interfaces/user.interfaces";

type InitStateProps = {
    serviceProviders: IUserProfile[];
    maybeServiceProviders: IUserProfile[];
    unknownServiceProviders: IUserProfile[];
    availableServiceProviders: IUserProfile[];
    unAvailableServiceProviders: IUserProfile[];
    selectedServiceProviders: IUserProfile | null;
    selectedClient: IUserProfile | null;
    selectedModerator: IUserProfile | null;
    allClients: IUserProfile[];
    allModerator: IUserProfile[]
};
const initialState: InitStateProps = {
    serviceProviders: [],
    maybeServiceProviders: [],
    unknownServiceProviders: [],
    availableServiceProviders: [],
    unAvailableServiceProviders: [],
    allClients: [],
    selectedModerator: null,
    selectedClient: null,
    selectedServiceProviders: null,
    allModerator: []
};

const userSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        saveAllServiceProviders: (state, action: PayloadAction<IUserProfile[]>) => {
            state.serviceProviders = action.payload;
        },
        saveMaybeServiceProviders: (state, action: PayloadAction<IUserProfile[]>) => {
            state.maybeServiceProviders = action.payload;
        },
        saveUnknownServiceProviders: (state, action: PayloadAction<IUserProfile[]>) => {
            state.unknownServiceProviders = action.payload;
        },
        saveAvailableServiceProviders: (state, action: PayloadAction<IUserProfile[]>) => {
            state.availableServiceProviders = action.payload;
        },
        saveUnavailableServiceProviders: (state, action: PayloadAction<IUserProfile[]>) => {
            state.unAvailableServiceProviders = action.payload;
        },
        saveAllClients: (state, action: PayloadAction<IUserProfile[]>) => {
            state.allClients = action.payload;
        },
        saveAllModerator: (state, action: PayloadAction<IUserProfile[]>) => {
            state.allModerator = action.payload;
        },
        saveSelectedServiceProviders: (state, action: PayloadAction<IUserProfile | null>) => {
            state.selectedServiceProviders = action.payload;
        },
        saveSelectedClient: (state, action: PayloadAction<IUserProfile | null>) => {
            state.selectedClient = action.payload;
        },
        saveSelectedModerator: (state, action: PayloadAction<IUserProfile | null>) => {
            state.selectedModerator = action.payload;
        },
    },
});

export const {saveAllServiceProviders, saveAllClients, saveAllModerator, saveSelectedServiceProviders, saveSelectedModerator, saveSelectedClient, saveMaybeServiceProviders, saveUnavailableServiceProviders, saveUnknownServiceProviders, saveAvailableServiceProviders} = userSlice.actions;

export default userSlice.reducer;
