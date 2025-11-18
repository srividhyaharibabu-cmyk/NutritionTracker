// import React from 'react'
// import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material'

// const MacroCard = ({ title, current, target, color, unit = 'g' }) => {
//   const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0

//   return (
//     <Card
//       sx={{
//         width: 200,
//         height: 200,
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//         p: 2,
//         borderRadius: 3,
//         boxShadow: 3,
//       }}
//     >
//       <CardContent
//         sx={{
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           textAlign: 'center',
//           p: 0,
//         }}
//       >
//         <Typography variant="subtitle1" fontWeight={600}>
//           {title}
//         </Typography>

//         <Typography variant="h5" color={color} fontWeight="bold">
//           {current}{unit}
//         </Typography>

//         <Box sx={{ width: '80%', mt: 1 }}>
//           <LinearProgress
//             variant="determinate"
//             value={percentage}
//             sx={{
//               height: 8,
//               borderRadius: 5,
//               [`& .MuiLinearProgress-bar`]: { backgroundColor: color },
//             }}
//           />
//         </Box>

//         <Typography variant="caption" sx={{ mt: 1 }}>
//           Target: {target}{unit}
//         </Typography>
//       </CardContent>
//     </Card>
//   )
// }

// export default MacroCard


import React from 'react'
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material'

interface MacroCardProps {
  title: string
  current: number
  target: number
  color: string
  unit?: string
}

const MacroCard: React.FC<MacroCardProps> = ({ title, current, target, color, unit = 'g' }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0

  return (
    <Card
      sx={{
        width: 200,
        height: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <CardContent
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'center',
          p: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>

        <Typography variant="h5" color={color} fontWeight="bold">
          {current}{unit}
        </Typography>

        <Box sx={{ width: '80%', mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 8,
              borderRadius: 5,
              [`& .MuiLinearProgress-bar`]: { backgroundColor: color },
            }}
          />
        </Box>

        <Typography variant="caption" sx={{ mt: 1 }}>
          Target: {target}{unit}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default MacroCard
