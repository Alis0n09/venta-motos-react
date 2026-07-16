// src/presentation/components/crud/FormDialog.tsx

import { useEffect, type ReactNode } from 'react'
import {
  useForm, FormProvider,
  type DefaultValues, type FieldValues, type Path, type Resolver,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress,
} from '@mui/material'
import { colors } from '@/presentation/theme/colors'
import { ApiException } from '@/domain/exceptions/api.exception'

interface FormDialogProps<TFormValues extends FieldValues> {
  open: boolean
  mode: 'create' | 'edit'
  /** Nombre de la entidad en el título: "Nuevo {entityLabel}" / "Editar {entityLabel}". */
  entityLabel: string
  schema: ZodType<TFormValues>
  defaultValues: DefaultValues<TFormValues>
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (values: TFormValues) => Promise<void> | void
  /** Campos del formulario. Cada campo usa `useFormContext<TFormValues>()` para conectarse. */
  children: ReactNode
}

/**
 * Modal de creación/edición genérico. No conoce los campos de ninguna
 * entidad concreta: las páginas de cada entidad pasan sus propios <TextField>
 * (u otros inputs) como children, conectados vía useFormContext + Controller.
 */
export default function FormDialog<TFormValues extends FieldValues>({
  open, mode, entityLabel, schema, defaultValues,
  isSubmitting = false, onClose, onSubmit, children,
}: FormDialogProps<TFormValues>) {
  const methods = useForm<TFormValues>({
    // Los tipos de @hookform/resolvers/zod no infieren bien sobre un ZodType
    // genérico (TFormValues); el cast es seguro porque TFormValues es el
    // output real de `schema`.
    resolver: zodResolver(schema as never) as Resolver<TFormValues>,
    defaultValues,
  })

  const { handleSubmit, reset, setError } = methods

  useEffect(() => {
    if (open) reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function submit(values: TFormValues) {
    try {
      await onSubmit(values)
    } catch (err) {
      const apiErr = err as ApiException
      if (apiErr.fieldErrors) {
        for (const [field, messages] of Object.entries(apiErr.fieldErrors)) {
          setError(field as Path<TFormValues>, { type: 'server', message: messages[0] })
        }
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(submit)}>
          <DialogTitle sx={{ fontWeight: 800, color: colors.textPrimary }}>
            {mode === 'create' ? `Nuevo ${entityLabel}` : `Editar ${entityLabel}`}
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {children}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} disabled={isSubmitting} sx={{ color: colors.textSecondary }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                bgcolor: colors.primary,
                color: colors.textOnPrimary,
                fontWeight: 700,
                borderRadius: 3,
                px: 3,
                '&:hover': { bgcolor: colors.primaryDark },
                '&:disabled': { opacity: 0.6 },
              }}
            >
              {isSubmitting ? <CircularProgress size={20} sx={{ color: colors.textOnPrimary }} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  )
}
