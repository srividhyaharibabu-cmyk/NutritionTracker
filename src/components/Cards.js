import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';
const MacroCard = ({ title, current, target, color, unit = 'g' }) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    return (_jsx(Card, { sx: {
            width: 200,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            borderRadius: 3,
            boxShadow: 3,
        }, children: _jsxs(CardContent, { sx: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'center',
                p: 0,
            }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: title }), _jsxs(Typography, { variant: "h5", color: color, fontWeight: "bold", children: [current, unit] }), _jsx(Box, { sx: { width: '80%', mt: 1 }, children: _jsx(LinearProgress, { variant: "determinate", value: percentage, sx: {
                            height: 8,
                            borderRadius: 5,
                            [`& .MuiLinearProgress-bar`]: { backgroundColor: color },
                        } }) }), _jsxs(Typography, { variant: "caption", sx: { mt: 1 }, children: ["Target: ", target, unit] })] }) }));
};
export default MacroCard;
//# sourceMappingURL=Cards.js.map