// src/presentation/pages/client/HistorialClientePage.tsx

import { useState, useEffect } from 'react'
import {
  Box, Typography, Container, Skeleton, Chip, Card, CardContent,
} from '@mui/material'
import { HistoryOutlined } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { historialClienteUseCase } from '@/infrastructure/factories/historial-cliente.factory'
import { formatDate, formatPrice, formatDateShort } from '@/presentation/utils/formatters'
import type { HistorialCliente } from '@/domain/entities/historial-cliente.entity'

const TIPO_LABEL: Record<string, string> = {
  compra: 'Compra',
  mantenimiento: 'Mantenimiento',
  garantia: 'Garantía',
  financiamiento: 'Financiamiento',
  resena: 'Reseña',
}

const TIPO_COLOR: Record<string, string> = {
  compra: colors.accent,
  mantenimiento: colors.warning,
  garantia: colors.success,
  financiamiento: colors.primary,
  resena: colors.textSecondary,
}

export default function HistorialClientePage() {
  const [eventos, setEventos] = useState<HistorialCliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historialClienteUseCase.listarMiHistorial()
      .then(setEventos)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '70vh', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 4 }}>
          Mi Historial
        </Typography>

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2 }} />
          ))
        ) : eventos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <HistoryOutlined sx={{ fontSize: 64, color: colors.accent, opacity: 0.4 }} />
            <Typography sx={{ color: colors.textSecondary, mt: 2 }}>
              Todavía no hay eventos registrados en tu historial.
            </Typography>
          </Box>
        ) : (
          eventos.map((evento) => {
            const color = TIPO_COLOR[evento.tipo_evento] ?? colors.textSecondary
            return (
              <Card key={evento.id} sx={{ borderRadius: 3, mb: 2, borderLeft: `4px solid ${color}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label={TIPO_LABEL[evento.tipo_evento] ?? evento.tipo_evento}
                      size="small"
                      sx={{ bgcolor: `${color}20`, color, fontWeight: 700 }}
                    />
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      {formatDate(evento.fecha)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.textPrimary }}>
                    {describirEvento(evento)}
                  </Typography>
                </CardContent>
              </Card>
            )
          })
        )}
      </Container>
    </Box>
  )
}

function describirEvento(evento: HistorialCliente): string {
  const d = evento.detalle as Record<string, any>

  switch (evento.tipo_evento) {
    case 'compra': {
      const motos = Array.isArray(d.motos) && d.motos.length > 0 ? d.motos.join(', ') : null
      const total = d.total ? formatPrice(Number(d.total)) : null
      const metodo = d.metodo_pago ? ` · pagado con ${d.metodo_pago}` : ''
      return motos
        ? `Compraste ${motos}${total ? ` por ${total}` : ''}${metodo}.`
        : `Compra #${d.venta_id ?? ''} registrada${total ? ` por ${total}` : ''}.`
    }

    case 'financiamiento': {
      const monto = d.monto_financiado ? formatPrice(Number(d.monto_financiado)) : null
      const plazo = d.plazo_meses ? `${d.plazo_meses} meses` : null
      const inicio = d.fecha_inicio ? formatDateShort(d.fecha_inicio) : null
      return `Se aprobó tu financiamiento${monto ? ` de ${monto}` : ''}${plazo ? ` a ${plazo}` : ''}${
        inicio ? `, con inicio el ${inicio}` : ''
      }.`
    }

    case 'mantenimiento': {
      const moto = d.moto ? ` de tu ${d.moto}` : ''
      const tipo = d.tipo ? d.tipo : 'mantenimiento'
      const fecha = d.fecha ? ` programado para el ${formatDateShort(d.fecha)}` : ''
      return `Registramos un ${tipo}${moto}${fecha}.`
    }

    case 'garantia': {
      const tipo = d.tipo ? d.tipo : 'Garantía'
      const inicio = d.fecha_inicio ? formatDateShort(d.fecha_inicio) : null
      const fin = d.fecha_fin ? formatDateShort(d.fecha_fin) : null
      return `Se activó tu garantía "${tipo}"${inicio && fin ? `, válida del ${inicio} al ${fin}` : ''}.`
    }

    case 'resena': {
      const moto = d.moto ? ` a ${d.moto}` : ''
      const rating = d.rating ? ` (${d.rating}/5)` : ''
      return `Dejaste una reseña${moto}${rating}.`
    }

    default:
      return 'Evento registrado en tu historial.'
  }
}