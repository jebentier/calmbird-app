import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as AuthSession from 'expo-auth-session';

const oauth2AuthorizationURL = 'http://localhost:3000/mobile/oauth2_authorize';
const oauth2FinalizeURL      = 'http://localhost:3000/mobile/oauth2_finalize';

const redirect = AuthSession.makeRedirectUri({ useProxy: true });

const name         = 'auth';
const initialState = { user: null };

const getAuthURL = async (callback_url) => {
  console.log('Fetching OAuth2 URL fetched...');
  const authUrlResponse = await fetch(
    oauth2AuthorizationURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_url })
    }
  );
  const authUrlData = await authUrlResponse.json();
  console.log('OAuth2 URL fetched!');
  return authUrlData;
};

const finalizeAuth = async (code, code_verifier, callback_url) => {
  console.log('Finalizing OAuth2 flow...');
  const finalizedResponse = await fetch(
    oauth2FinalizeURL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier, callback_url })
    }
  );
  const finalizedData = await finalizedResponse.json();
  console.log('OAuth2 flow finalized!');
  return finalizedData;
};

export const login = createAsyncThunk(
  'auth/login',
  async (_thunkAPI) => {
    // Step #1 - first we need to fetch an authorization uri to start the browser-based authentication flow
    const authUrlData = await getAuthURL(redirect);

    // Step #2 - after we received the authorization uri, we can start the auth flow using it
    const authResponse = await AuthSession.startAsync({ authUrl: authUrlData.authorization_uri });
    console.log('Auth response received!');

    // Validate if the auth session response is successful
    // Note, we still receive a `authResponse.type = 'success'`, thats why we need to check on the params itself
    if (authResponse.params && authResponse.params.error) {
      throw Error('AuthSession failed, user did not authorize the app');
    }

    // Step #3 - when the user (successfully) authorized the app, we will receive a verification code.
    // With this code we can request an access token and finish the auth flow.
    return await finalizeAuth(authResponse.params.code, authUrlData.code_verifier, redirect);
  }
);

export const authSlice = createSlice({
  name,
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload
    });
  }
});

export const selectUser = (state) => state?.auth?.user
export const { logout } = authSlice.actions
export default authSlice.reducer
