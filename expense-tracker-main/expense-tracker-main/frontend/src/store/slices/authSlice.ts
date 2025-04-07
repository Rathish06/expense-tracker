import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false
};

interface CredentialsPayload {
    user: User;
    token: string;
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state: AuthState, action: PayloadAction<CredentialsPayload>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        logout: (state: AuthState) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        }
    }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer; 