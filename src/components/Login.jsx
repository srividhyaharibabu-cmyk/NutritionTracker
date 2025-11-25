import { useState } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Typography, Avatar,
  Alert, InputAdornment, IconButton
} from '@mui/material'
import { FitnessCenter, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material'

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (credentials.username === 'admin' && credentials.password === 'password') {
      onLogin(credentials.username)
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mb: 2 }}>
              <FitnessCenter fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              PK Nutrition
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Sign in to access your nutrition analytics
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Sign In
            </Button>
          </form>

          <Box textAlign="center" mt={2}>
            <Typography variant="caption" color="text.secondary">
              Demo: admin / password
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login