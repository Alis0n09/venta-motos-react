// src/presentation/components/crud/ConfirmDialog.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, CircularProgress,
} from '@mui/material'
import { colors } from '@/presentation/theme/colors'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  isLoading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Modal de confirmación reutilizable, pensado para borrados. */
export default function ConfirmDialog({
  open,
  title = 'Confirmar eliminación',
  message,
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: colors.textPrimary }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: colors.textSecondary }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} disabled={isLoading} sx={{ color: colors.textSecondary }}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={isLoading}
          sx={{
            bgcolor: colors.error,
            color: colors.textOnPrimary,
            fontWeight: 700,
            borderRadius: 3,
            px: 3,
            '&:hover': { bgcolor: '#b31f1f' },
            '&:disabled': { opacity: 0.6 },
          }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ color: colors.textOnPrimary }} /> : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
