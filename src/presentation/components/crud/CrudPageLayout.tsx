// src/presentation/components/crud/CrudPageLayout.tsx

import type { ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'

interface CrudPageLayoutProps {
  title: string
  newButtonLabel?: string
  onNew?: () => void
  /** El botón "Nuevo" solo se muestra si es true y se pasa onNew. */
  canWrite?: boolean
  children: ReactNode
}

/** Mismo ancho/padding que AppShell (max-width 1200, px responsive). */
export default function CrudPageLayout({
  title,
  newButtonLabel = 'Nuevo',
  onNew,
  canWrite = false,
  children,
}: CrudPageLayoutProps) {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: colors.textPrimary }}>
          {title}
        </Typography>

        {canWrite && onNew && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onNew}
            sx={{
              bgcolor: colors.accent,
              color: colors.textOnAccent,
              fontWeight: 700,
              borderRadius: 3,
              '&:hover': { bgcolor: '#e0265e' },
            }}
          >
            {newButtonLabel}
          </Button>
        )}
      </Box>

      {children}
    </Box>
  )
}
