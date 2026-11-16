import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IEvent, IInvoices, IPurchaseOrder } from "@/interfaces/event.interfaces";
import { IProject } from "@/interfaces/project.interfaces";

type InitStateProps = {
    events: IEvent[];
    potentialEvents: IEvent[];
    selectedEvent?: IEvent
    invoice?: IInvoices
    purchaseOrder?: IPurchaseOrder
    purchaseOrders: IPurchaseOrder[]
    projects: IProject[]
};
const initialState: InitStateProps = {
    events: [],
    potentialEvents: [],
    purchaseOrders: [],
    projects: []
};

const eventSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        saveEvents: (state, action: PayloadAction<IEvent[]>) => {
            state.events = action.payload;
        },
        savePotentialEvents: (state, action: PayloadAction<IEvent[]>) => {
            state.potentialEvents = action.payload;
        },
        filterPotentialEvents: (state, action: PayloadAction<number>) => {
            state.potentialEvents = state.potentialEvents.filter(value => value.id !== action.payload)
        },
        saveSelectedEvent: (state, action: PayloadAction<IEvent>) => {
            state.selectedEvent = action.payload;
        },
        saveInvoice: (state, action: PayloadAction<IInvoices>) => {
            state.invoice = action.payload;
        },
        resetInvoice: (state) => {
            state.invoice = initialState.invoice;
        },
        resetPurchaseOrder: (state) => {
            state.purchaseOrder = initialState.purchaseOrder;
            state.purchaseOrders = initialState.purchaseOrders;
        },
        savePurchaseOrders: (state, action: PayloadAction<IPurchaseOrder[]>) => {
            state.purchaseOrders = action.payload;
        },
        savePurchaseOrder: (state, action: PayloadAction<IPurchaseOrder>) => {
            state.purchaseOrder = action.payload;
        },
        updatePurchaseOrder: (state, action: PayloadAction<IPurchaseOrder>) => {
            state.purchaseOrders = state.purchaseOrders.map(order =>
                order.id === action.payload.id ? action.payload : order
            );
        },
        // removePurchaseOrder: (state, action: PayloadAction<number>) => {
        //     state.purchaseOrders = state.purchaseOrders.filter(order =>
        //         order.id !== action.payload
        //     );
        // },
        removePurchaseOrder: (state, action: PayloadAction<number>) => {
            state.purchaseOrders = state.purchaseOrders.filter(order =>
                order.id !== action.payload
            );
            // Clear the selected purchase order if it's the one being deleted
            if (state.purchaseOrder?.id === action.payload) {
                state.purchaseOrder = undefined;
            }
        },
        saveProjects: (state, action: PayloadAction<IProject[]>) => {
            state.projects = action.payload;
        },
        addProject: (state, action: PayloadAction<IProject>) => {
            state.projects = [action.payload, ...state.projects.filter(project => project.id !== action.payload.id)];
        },
        updateProjectEntry: (state, action: PayloadAction<IProject>) => {
            state.projects = state.projects.map(project => project.id === action.payload.id ? action.payload : project);
        },
        removeProjectEntry: (state, action: PayloadAction<number>) => {
            state.projects = state.projects.filter(project => project.id !== action.payload);
        }
    },
});

export const { saveEvents, saveInvoice, savePotentialEvents, saveSelectedEvent,
    filterPotentialEvents, resetInvoice, resetPurchaseOrder, savePurchaseOrders,
    savePurchaseOrder, updatePurchaseOrder, removePurchaseOrder,
    saveProjects, addProject, updateProjectEntry, removeProjectEntry } = eventSlice.actions;

export default eventSlice.reducer;
