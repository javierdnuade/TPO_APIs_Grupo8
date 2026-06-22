import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getUsuariosConPermisos, updatePermisosUsuario } from '../../api/admin';

export const fetchUsuariosConPermisos = createAsyncThunk(
  'permisos/fetchUsuarios',
  async (_, { rejectWithValue }) => {
    try {
      return await getUsuariosConPermisos();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePermisos = createAsyncThunk(
  'permisos/updatePermisos',
  async ({ id, permisos }, { rejectWithValue }) => {
    try {
      const usuario = await updatePermisosUsuario(id, permisos);
      return { id, usuario };
    } catch (err) {
      return rejectWithValue({ id, message: err.message });
    }
  }
);

const permisosSlice = createSlice({
  name: 'permisos',
  initialState: {
    lista: [],
    loading: false,
    updatingUserId: null,
    error: null,
    success: null,
  },
  reducers: {
    clearStatus(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuariosConPermisos.pending, (state) => {
        state.loading = true;
        state.lista = [];
        state.error = null;
        state.success = null;
      })
      .addCase(fetchUsuariosConPermisos.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchUsuariosConPermisos.rejected, (state, action) => {
        state.loading = false;
        state.lista = [];
        state.error = action.payload;
      })
      .addCase(updatePermisos.pending, (state, action) => {
        state.updatingUserId = action.meta.arg.id;
        state.error = null;
        state.success = null;
      })
      .addCase(updatePermisos.fulfilled, (state, action) => {
        state.updatingUserId = null;
        state.success = `Permisos actualizados para ${action.payload.usuario.username}.`;
        state.lista = state.lista.map((usuario) =>
          usuario.id === action.payload.id ? action.payload.usuario : usuario
        );
      })
      .addCase(updatePermisos.rejected, (state, action) => {
        state.updatingUserId = null;
        state.error = action.payload?.message ?? 'No se pudieron actualizar los permisos.';
      });
  },
});

export const { clearStatus } = permisosSlice.actions;
export default permisosSlice.reducer;
