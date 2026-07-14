// src/presentation/pages/ContactPage.tsx

import { useState, useEffect } from 'react'
import {
  Box, Typography, Container, Grid, Card, CardContent,
  TextField, Button, CircularProgress, Alert,
} from '@mui/material'
import { Phone, Email, WhatsApp } from '@mui/icons-material'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { colors } from '@/presentation/theme/colors'
import { apiClient } from '@/infrastructure/http/axios-client'

// ─── Mover mapa al seleccionar sucursal ───────────────────────────────────────

function MapaMover({ centro }: { centro: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(centro, 15, { duration: 1 })
  }, [centro, map])
  return null
}

// ─── Iconos SVG tipo gota ─────────────────────────────────────────────────────

const iconoNormal = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="37">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z" fill="${colors.primary}"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  iconSize: [25, 37],
  iconAnchor: [12, 37],
  popupAnchor: [0, -37],
})

const iconoActivo = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="37">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z" fill="${colors.accent}"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  iconSize: [25, 37],
  iconAnchor: [12, 37],
  popupAnchor: [0, -37],
})

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Sucursal {
  id: number
  nombre: string
  direccion: string
  ciudad: string
  telefono: string | null
  latitud: string | null
  longitud: string | null
}

interface ContactForm {
  nombre: string
  mensaje: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCoordenadas(s: Sucursal): [number, number] {
  if (s.latitud && s.longitud) {
    return [Number(s.latitud), Number(s.longitud)]
  }
  const FALLBACK: Record<string, [number, number]> = {
    'quito': [-0.1807, -78.4678],
    'guayaquil': [-2.1710, -79.9224],
    'cuenca': [-2.9001, -79.0059],
    'ambato': [-1.2543, -78.6269],
    'loja': [-3.9931, -79.2042],
  }
  return FALLBACK[s.ciudad.toLowerCase().trim()] ?? [-1.8312, -78.1834]
}

// ─── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({ icon, title, lines }: { icon: React.ReactNode, title: string, lines: string[] }) {
  return (
    <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ color: colors.accent, mb: 1.5 }}>{icon}</Box>
        <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
          {title}
        </Typography>
        {lines.map((line, i) => (
          <Typography key={i} variant="body2" sx={{ color: colors.accent, fontWeight: 500 }}>
            {line}
          </Typography>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── ContactPage ──────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [selected, setSelected] = useState<Sucursal | null>(null)
  const [form, setForm] = useState<ContactForm>({ nombre: '', mensaje: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    apiClient.get('/sucursales/?page_size=100')
      .then((res) => {
        const data = res.data
        const lista: Sucursal[] = Array.isArray(data) ? data : data.results ?? []
        setSucursales(lista)
        if (lista.length > 0) setSelected(lista[0])
      })
      .catch(() => {})
  }, [])

  function handleChange(field: keyof ContactForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSent(true)
    setForm({ nombre: '', mensaje: '' })
    setSending(false)
  }

  const allCoords = sucursales.map((s) => getCoordenadas(s))
  const centro: [number, number] = allCoords.length > 0
    ? [
        allCoords.reduce((acc, c) => acc + c[0], 0) / allCoords.length,
        allCoords.reduce((acc, c) => acc + c[1], 0) / allCoords.length,
      ]
    : [-1.8312, -78.1834]

  const alturaLista = Math.max(sucursales.length * 100, 300)

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">

        {/* ── Header ── */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="caption" sx={{
            color: colors.accent, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase', display: 'block', mb: 1,
          }}>
            Contáctanos
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 1 }}>
            Visita nuestras sucursales
          </Typography>
          <Typography variant="body1" sx={{ color: colors.accent }}>
            Encuentra el local más cercano o escribenos directamente
          </Typography>
        </Box>

        {/* ── Mapa + lista sucursales ── */}
        <Grid container spacing={0} sx={{ mb: 5, border: `1px solid ${colors.border}`, borderRadius: 3, overflow: 'hidden' }}>

          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ height: alturaLista }}>
              {sucursales.length > 0 && (
                <MapContainer
                  center={centro}
                  zoom={7}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {selected && <MapaMover centro={getCoordenadas(selected)} />}
                  {sucursales.map((s) => (
                    <Marker
                      key={s.id}
                      position={getCoordenadas(s)}
                      icon={selected?.id === s.id ? iconoActivo : iconoNormal}
                      eventHandlers={{ click: () => setSelected(s) }}
                    >
                      <Popup>
                        <strong>{s.nombre}</strong><br />
                        {s.direccion}<br />
                        {s.ciudad}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ height: alturaLista, overflowY: 'auto', bgcolor: colors.surface }}>
              {sucursales.map((s, i) => (
                <Box
                  key={s.id}
                  onClick={() => setSelected(s)}
                  sx={{
                    p: 2.5, cursor: 'pointer',
                    borderBottom: i < sucursales.length - 1 ? `1px solid ${colors.border}` : 'none',
                    borderLeft: selected?.id === s.id ? `4px solid ${colors.accent}` : '4px solid transparent',
                    bgcolor: selected?.id === s.id ? colors.accentLight : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: colors.accentLight },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>
                    {s.nombre}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                    {s.direccion}
                  </Typography>
                  {s.telefono && (
                    <Typography variant="body2" sx={{ color: colors.accent, fontWeight: 600 }}>
                      {s.telefono}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* ── Info + formulario ── */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoCard
              icon={<Phone />}
              title="Teléfono"
              lines={['2-256-9853', '099 456 7890']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoCard
              icon={<Email />}
              title="Correo"
              lines={['ventas@victalspeed.com', 'soporte@victalspeed.com']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoCard
              icon={<WhatsApp />}
              title="WhatsApp"
              lines={['Respuesta en minutos', '099 456 7890']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, bgcolor: colors.primary, border: `1px solid ${colors.border}`, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textOnPrimary, mb: 2 }}>
                  Escribenos
                </Typography>

                {sent && (
                  <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSent(false)}>
                    ¡Mensaje enviado!
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange('nombre')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: colors.textOnPrimary,
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: colors.accent },
                      },
                      '& input::placeholder': { color: 'rgba(255,255,255,0.5)' },
                    }}
                  />
                  <TextField
                    fullWidth multiline rows={3}
                    placeholder="Mensaje"
                    value={form.mensaje}
                    onChange={handleChange('mensaje')}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: colors.textOnPrimary,
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: colors.accent },
                      },
                      '& textarea::placeholder': { color: 'rgba(255,255,255,0.5)' },
                    }}
                  />
                  <Button
                    type="submit" variant="contained" fullWidth
                    disabled={sending}
                    sx={{
                      bgcolor: colors.accent, color: '#fff',
                      fontWeight: 700, borderRadius: 3,
                      '&:hover': { bgcolor: '#e0265e' },
                    }}
                  >
                    {sending ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Enviar'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Container>
    </Box>
  )
}