import Box from '@mui/material/Box'

export interface BrandLogoProps {
  size?: number
}

export function BrandLogo({ size = 28 }: BrandLogoProps) {
  return (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded square background */}
        <rect x="4" y="4" width="40" height="40" rx="12" fill="currentColor" opacity="0.18" />

        {/* Book */}
        <path
          d="M16 15.5C16 14.7 16.7 14 17.5 14H30.5C31.3 14 32 14.7 32 15.5V34C32 34.8 31.3 35.5 30.5 35.5H18.8C17.3 35.5 16 34.2 16 32.7V15.5Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M18.5 18H29.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M18.5 22.5H27"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Checkmark (learning) */}
        <path
          d="M20.5 30.2L23.2 32.9L28.7 27.4"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

