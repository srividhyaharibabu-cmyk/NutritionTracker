import { useState } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Typography, Avatar,
  Alert, InputAdornment, IconButton, Tabs, Tab, Divider
} from '@mui/material'
import { FitnessCenter, Visibility, VisibilityOff, Login as LoginIcon, PersonAdd } from '@mui/icons-material'

const AuthForm = ({ onLogin }) => {
  const [tab, setTab] = useState(0)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Demo authentication - replace with actual API calls when backend is ready
      if (tab === 0) {
        // Login
        const signupUser = JSON.parse(localStorage.getItem('signupUser') || 'null')
        
        if ((formData.username === 'admin' && formData.password === 'password') ||
            (signupUser && formData.username === signupUser.username && formData.password === signupUser.password)) {
          const user = signupUser && formData.username === signupUser.username ? 
            { id: 2, username: signupUser.username, email: signupUser.email } :
            { id: 1, username: 'admin', email: 'admin@demo.com' }
          
          localStorage.setItem('token', 'demo_token')
          onLogin(user)
        } else {
          setError('Invalid credentials. Try: admin/password or your signup credentials')
        }
      } else {
        // Signup
        if (formData.username && formData.email && formData.password) {
          // Store the new user credentials
          localStorage.setItem('signupUser', JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          }))
          
          setTab(0)
          setError('')
          setFormData({ username: '', email: '', password: '' })
          alert(`Account created for ${formData.username}! You can now login with your credentials.`)
        } else {
          setError('Please fill all fields')
        }
      }
    } catch (error) {
      setError('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    try {
      // For demo purposes - simulate Microsoft login
      const mockMicrosoftUser = {
        id: 'ms_demo_user',
        username: 'Microsoft Demo User',
        email: 'demo@microsoft.com'
      }
      
      // Store demo token
      localStorage.setItem('token', 'demo_microsoft_token')
      onLogin(mockMicrosoftUser)
    } catch (error) {
      setError('Microsoft login failed')
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
          </Box>

          <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              margin="normal"
              required
            />
            
            {tab === 1 && (
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
            )}
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              startIcon={tab === 0 ? <LoginIcon /> : <PersonAdd />}
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Please wait...' : (tab === 0 ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleMicrosoftLogin}
            sx={{ py: 1.5, bgcolor: '#0078d4', color: 'white', '&:hover': { bgcolor: '#106ebe' } }}
          >
            Continue with Microsoft
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AuthForm