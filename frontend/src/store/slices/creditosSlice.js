import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCreditosPorCliente, crearCredito, anularCredito } from '../../api/creditos';

export const fetchCreditosPorCliente = createAsyncThunk('creditos/fetchPorCliente', async (dni, { rejectWithValue }) => {
  try {
    return await getCreditosPorCliente(dni);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addCredito = createAsyncThunk('creditos/add', async (data, { rejectWithValue }) => {
  try {
    return await crearCredito(data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteCredito = createAsyncThunk('creditos/delete', async (id, { rejectWithValue }) => {
  try {
    return await anularCredito(id);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const creditosSlice = createSlice({
  name: 'creditos',
  initialState: {
    lista: [],
    loading: false,
    error: null,
    anulandoId: null,
  },
  reducers: {
    clearCreditos(state) {
      state.lista = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreditosPorCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreditosPorCliente.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchCreditosPorCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCredito.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCredito.fulfilled, (state, action) => {
        state.loading = false;
        state.lista.push(action.payload);
      })
      .addCase(addCredito.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCredito.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.anulandoId = action.meta.arg;
      })
      .addCase(deleteCredito.fulfilled, (state, action) => {
        state.loading = false;
        state.anulandoId = null;
        state.lista = state.lista.map((credito) =>
          credito.id === action.payload.id ? action.payload : credito
        );
      })
      .addCase(deleteCredito.rejected, (state, action) => {
        state.loading = false;
        state.anulandoId = null;
        state.error = action.payload;
      });
  },
});

export const { clearCreditos, clearError } = creditosSlice.actions;
export default creditosSlice.reducer;
