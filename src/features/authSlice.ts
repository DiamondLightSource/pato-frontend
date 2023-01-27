import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../utils/api/client'

interface AuthState {
  user: {
    /** Display name for the user */
    name: string,
    /** Federation ID (or unique identification) */ 
    fedid: string } | null | undefined;
}

export const checkUser = createAsyncThunk('auth/checkUser', async (_, {rejectWithValue}) => {
  const user = await client.get("user")

  if (user.data.given_name === undefined) {
    return rejectWithValue("No response")
  }
  
  return user.data
})

const initialState: AuthState = {
  user: null
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(checkUser.fulfilled, (state, action) => {
      state.user = {name: action.payload.given_name, fedid: action.payload.fedid}
    })

    builder.addCase(checkUser.rejected, (state) => {
      sessionStorage.removeItem("token")
      state.user = null
    })
  }
})

export default authSlice.reducer
