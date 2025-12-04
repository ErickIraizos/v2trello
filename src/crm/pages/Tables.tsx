import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  TextField,
  Stack,
  Card,
  IconButton,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useActivityLog } from '../hooks/useActivityLog';
import { initialBoards } from '../data/initialData';
import KanbanBoard from '../components/KanbanBoard';
import { Board } from '../types';

export default function Tables() {
  const [boards, setBoards] = useLocalStorage<Board[]>('crm_boards', initialBoards);
  const [selectedBoardIndex, setSelectedBoardIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const { addLog } = useActivityLog();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedBoardIndex(newValue);
  };

  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return;

    const newBoard: Board = {
      id: `board-${Date.now()}`,
      title: newBoardTitle,
      createdAt: new Date().toISOString(),
      columns: [
        { id: `col-${Date.now()}-1`, title: 'Planeación', cardIds: [] },
        { id: `col-${Date.now()}-2`, title: 'En Progreso', cardIds: [] },
        { id: `col-${Date.now()}-3`, title: 'Revisión', cardIds: [] },
        { id: `col-${Date.now()}-4`, title: 'Completado', cardIds: [] },
      ],
    };

    setBoards([...boards, newBoard]);
    addLog('Crear', 'Tablero', newBoardTitle, newBoard.id);
    setOpenDialog(false);
    setNewBoardTitle('');
    setSelectedBoardIndex(boards.length);
  };

  const handleEditBoard = (boardId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const updatedBoards = boards.map((b) =>
      b.id === boardId ? { ...b, title: newTitle } : b
    );
    setBoards(updatedBoards);
    addLog('Editar', 'Tablero', newTitle, boardId);
    setOpenDialog(false);
    setNewBoardTitle('');
    setEditingBoardId(null);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este tablero?')) {
      const boardToDelete = boards.find((b) => b.id === boardId);
      setBoards(boards.filter((b) => b.id !== boardId));
      addLog('Eliminar', 'Tablero', boardToDelete?.title || 'Desconocido', boardId);
      if (selectedBoardIndex >= boards.length - 1) {
        setSelectedBoardIndex(Math.max(0, boards.length - 2));
      }
    }
  };

  const handleOpenEditDialog = () => {
    const board = boards[selectedBoardIndex];
    if (board) {
      setNewBoardTitle(board.title);
      setEditingBoardId(board.id);
      setOpenDialog(true);
    }
  };

  const handleBoardUpdate = (updatedBoard: Board) => {
    const updatedBoards = boards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b));
    setBoards(updatedBoards);
  };

  const currentBoard = boards[selectedBoardIndex];

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Tableros
        </Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpenDialog(true)}>
          Nuevo Tablero
        </Button>
      </Box>

      {boards.length > 0 ? (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
              <Tabs value={selectedBoardIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ flex: 1 }}>
                {boards.map((board) => (
                  <Tab key={board.id} label={board.title} />
                ))}
              </Tabs>
              {boards.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEditDialog()}
                    sx={{ color: 'primary.main' }}
                    title="Editar tablero"
                  >
                    <EditRoundedIcon sx={{ fontSize: '1.25rem' }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (boards[selectedBoardIndex]) {
                        handleDeleteBoard(boards[selectedBoardIndex].id);
                      }
                    }}
                    sx={{ color: 'error.main' }}
                    title="Eliminar tablero"
                  >
                    <DeleteRoundedIcon sx={{ fontSize: '1.25rem' }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            {currentBoard && <KanbanBoard board={currentBoard} onBoardUpdate={handleBoardUpdate} />}
          </Box>
        </>
      ) : (
        <Card variant="outlined">
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No hay tableros creados
            </Typography>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpenDialog(true)}>
              Crear Primer Tablero
            </Button>
          </Box>
        </Card>
      )}

      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        setEditingBoardId(null);
        setNewBoardTitle('');
      }} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingBoardId ? 'Editar Tablero' : 'Crear Nuevo Tablero'}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Nombre del Tablero"
              fullWidth
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (editingBoardId) {
                    handleEditBoard(editingBoardId, newBoardTitle);
                  } else {
                    handleCreateBoard();
                  }
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setOpenDialog(false);
                setEditingBoardId(null);
                setNewBoardTitle('');
              }}>Cancelar</Button>
              <Button variant="contained" onClick={() => {
                if (editingBoardId) {
                  handleEditBoard(editingBoardId, newBoardTitle);
                } else {
                  handleCreateBoard();
                }
              }}>
                {editingBoardId ? 'Guardar Cambios' : 'Crear'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
