import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Stack,
  Card,
  CardContent,
  Button,
  Dialog,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useActivityLog } from '../hooks/useActivityLog';
import { initialUsers } from '../data/initialData';
import { User } from '../types';

export default function Users() {
  const [users, setUsers] = useLocalStorage<User[]>('crm_users', initialUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    avatar: '',
  });
  const { addLog } = useActivityLog();

  const departmentColor: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    Ventas: 'primary',
    Marketing: 'success',
    Soporte: 'info',
    Operaciones: 'warning',
    Administración: 'error',
  };

  const departments = ['Ventas', 'Marketing', 'Soporte', 'Operaciones', 'Administración'];

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        avatar: user.avatar,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        department: '',
        role: '',
        avatar: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      department: '',
      role: '',
      avatar: '',
    });
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email || !formData.department || !formData.role) {
      return;
    }

    const avatar = formData.avatar || formData.name.substring(0, 2).toUpperCase();

    if (editingUser) {
      const updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              department: formData.department,
              role: formData.role,
              avatar,
            }
          : u
      );
      setUsers(updatedUsers);
      addLog('Editar', 'Usuario', formData.name, editingUser.id, { departamento: formData.department });
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        role: formData.role,
        avatar,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      addLog('Crear', 'Usuario', formData.name, newUser.id, { departamento: formData.department });
    }
    handleCloseDialog();
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      setUsers(users.filter((u) => u.id !== userId));
      if (user) {
        addLog('Eliminar', 'Usuario', user.name, userId, { departamento: user.department });
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3, display: { xs: 'none', sm: 'flex' } }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Gestión de Usuarios
        </Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => handleOpenDialog()}>
          Nuevo Usuario
        </Button>
      </Stack>

      <Card variant="outlined">
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Departamento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha de Ingreso</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                            fontSize: '0.75rem',
                          }}
                        >
                          {user.avatar}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.department}
                        color={departmentColor[user.department] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.role}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(user.joinDate).toLocaleDateString('es-ES')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={formData.department}
                label="Departamento"
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Rol"
              fullWidth
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <TextField
              label="Avatar (Iniciales)"
              fullWidth
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value.substring(0, 2).toUpperCase() })}
              placeholder="Ej: AT"
              inputProps={{ maxLength: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button variant="contained" onClick={handleSaveUser}>
                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
