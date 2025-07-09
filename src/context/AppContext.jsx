import React, { createContext, useContext, useReducer, useEffect } from "react";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  customers: [],
  products: [],
  subscriptions: [],
  analytics: null,
};

// Actions
export const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_USER: "SET_USER",
  LOGOUT: "LOGOUT",
  SET_CUSTOMERS: "SET_CUSTOMERS",
  ADD_CUSTOMER: "ADD_CUSTOMER",
  UPDATE_CUSTOMER: "UPDATE_CUSTOMER",
  DELETE_CUSTOMER: "DELETE_CUSTOMER",
  SET_PRODUCTS: "SET_PRODUCTS",
  ADD_PRODUCT: "ADD_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",
  SET_SUBSCRIPTIONS: "SET_SUBSCRIPTIONS",
  ADD_SUBSCRIPTION: "ADD_SUBSCRIPTION",
  UPDATE_SUBSCRIPTION: "UPDATE_SUBSCRIPTION",
  DELETE_SUBSCRIPTION: "DELETE_SUBSCRIPTION",
  SET_ANALYTICS: "SET_ANALYTICS",
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };

    case ACTIONS.SET_CUSTOMERS:
      return { ...state, customers: action.payload };

    case ACTIONS.ADD_CUSTOMER:
      return {
        ...state,
        customers: [...state.customers, action.payload],
      };

    case ACTIONS.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map((customer) =>
          customer.id === action.payload.id ? action.payload : customer
        ),
      };

    case ACTIONS.DELETE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.filter(
          (customer) => customer.id !== action.payload
        ),
      };

    case ACTIONS.SET_PRODUCTS:
      return { ...state, products: action.payload };

    case ACTIONS.ADD_PRODUCT:
      return {
        ...state,
        products: [...state.products, action.payload],
      };

    case ACTIONS.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        ),
      };

    case ACTIONS.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(
          (product) => product.id !== action.payload
        ),
      };

    case ACTIONS.SET_SUBSCRIPTIONS:
      return { ...state, subscriptions: action.payload };

    case ACTIONS.ADD_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: [...state.subscriptions, action.payload],
      };

    case ACTIONS.UPDATE_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: state.subscriptions.map((subscription) =>
          subscription.id === action.payload.id ? action.payload : subscription
        ),
      };

    case ACTIONS.DELETE_SUBSCRIPTION:
      return {
        ...state,
        subscriptions: state.subscriptions.filter(
          (subscription) => subscription.id !== action.payload
        ),
      };

    case ACTIONS.SET_ANALYTICS:
      return { ...state, analytics: action.payload };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check for existing auth token on app load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // TODO: Validate token with backend
      // dispatch({ type: ACTIONS.SET_USER, payload: userData });
    }
  }, []);

  const value = {
    state,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
