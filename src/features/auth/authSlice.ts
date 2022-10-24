import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../../utils/api/client'

interface authState {
  token?: string
}

export const loginUser = createAsyncThunk('auth/loginUser', async (creds: { username: string, password: string }, {rejectWithValue}) => {
  const response = await client.post('ispyb/api/v1/auth/login', {...creds, plugin: "dummy"})
  if (response.status === 200) {
    return response.data.token
  } else if (response.status === 401) {
    return rejectWithValue("Unauthorized")
  }
})

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  const response = await client.post('logout', {})
  if (response.status === 200) {
    return response.data.token
  }
})

const initialState: authState = {
  token: undefined
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.token = action.payload
    })

    builder.addCase(logoutUser.fulfilled, (state, action) => {
      state.token = undefined
    })
  }
})

export default authSlice.reducer
