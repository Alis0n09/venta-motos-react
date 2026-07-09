// src/presentation/pages/PlaceholderPage.tsx

import { Box, Typography } from '@mui/material'
import { DirectionsBike } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'

interface PlaceholderPageProps {
  title: string
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 2,
    }}>
      <DirectionsBike sx={{ fontSize: 64, color: colors.accent, opacity: 0.5 }} />
      <Typography variant="h5" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
        Esta sección está en construcción
      </Typography>
    </Box>
  )
}