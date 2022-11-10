import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../utils/api/client'

interface authState {
  user: string | null
}

export const checkUser = createAsyncThunk('auth/checkUser', async () => {
  const user = await client.get("user")
  return user.data.id
})

const initialState: authState = {
  user: null
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(checkUser.fulfilled, (state, action) => {
      state.user = action.payload
    })

    builder.addCase(checkUser.rejected, (state) => {
      sessionStorage.removeItem("token")
      state.user = null
    })
  }
})

export default authSlice.reducer
