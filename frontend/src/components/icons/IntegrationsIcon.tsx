import { Box } from '@radix-ui/themes'

interface IntegrationsIconProps {
  size?: number
}

/** Иконка интеграций — два связанных блока */
export function IntegrationsIcon({ size = 16 }: IntegrationsIconProps) {
  const scale = size / 16
  const big = 8 * scale
  const small = 4 * scale
  return (
    <Box style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <Box
        style={{
          width: big,
          height: big,
          border: '1px solid currentColor',
          borderRadius: 2 * scale,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <Box
        style={{
          width: small,
          height: small,
          borderTop: '1px solid currentColor',
          borderRight: '1px solid currentColor',
          position: 'absolute',
          bottom: 0,
          right: 0,
        }}
      />
    </Box>
  )
}
