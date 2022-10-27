import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../../utils/api/client'

interface authState {
  token?: string
}

export const loginUser = createAsyncThunk('auth/loginUser', async (creds: { username: string, password: string }, {rejectWithValue}) => {
  let body = new FormData()
  body.append("username", creds.username)
  body.append("password", creds.password)

  const response = await client.post('login', body)
  if (response.status === 200) {
    return response.data.token
  } else if (response.status === 401) {
    return rejectWithValue("Unauthorized")
  }
})

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  const response = await client.post('logout', {})
  if (response.status === 200) {
    return "OK"
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
      window.sessionStorage.setItem("token", action.payload)
      state.token = action.payload
    })

    builder.addCase(logoutUser.fulfilled, (state, action) => {
      window.sessionStorage.removeItem("token")
      state.token = undefined
    })
  }
})

export default authSlice.reducer
