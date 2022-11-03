import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../utils/api/client'

interface authState {
  loggedIn: boolean
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

export const checkUser = createAsyncThunk('auth/checkUser', async () => {
  await client.get("user")
  return "OK"
})

const initialState: authState = {
  loggedIn: false
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      sessionStorage.setItem("token", action.payload)
      state.loggedIn = true
    })

    builder.addCase(logoutUser.fulfilled, (state) => {
      sessionStorage.removeItem("token")
      state.loggedIn = false
    })

    builder.addCase(checkUser.fulfilled, (state) => {
      state.loggedIn = true
    })

    builder.addCase(checkUser.rejected, (state) => {
      sessionStorage.removeItem("token")
      state.loggedIn = false
    })
  }
})

export default authSlice.reducer
