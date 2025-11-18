import { useState, useEffect, useMemo } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, Select, MenuItem, FormControl,
  InputLabel, Button, CircularProgress, LinearProgress, Chip, Avatar,
  Paper, TextField
} from '@mui/material'
import {
  Restaurant, Refresh
} from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const [selectedSheet, setSelectedSheet] = useState('sheet1')
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

const sheetUrls = {
  sheet1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmqh0VTkfkP3BNQfPSwz71zBP4ay0AGuTSUvx3W4JwP5JeiJmiY8I1Oa2rV8sU3QGv0ipq4kFpwucz/pub?output=csv&gid=0',
  sheet2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmqh0VTkfkP3BNQfPSwz71zBP4ay0AGuTSUvx3W4JwP5JeiJmiY8I1Oa2rV8sU3QGv0ipq4kFpwucz/pub?output=csv&gid=1998232576'
}



  const DAILY_GOALS = {
    calories: 2200,
    protein: 120,
    fat: 73,
    fiber: 25
  }

  const fetchData = async () => {
  if (!sheetUrls[selectedSheet]) return
  setLoading(true)
  try {
    console.log('Fetching from:', sheetUrls[selectedSheet])
    const response = await fetch(sheetUrls[selectedSheet])
    const csvText = await response.text()
    console.log('Raw CSV text:', csvText.substring(0, 500))
    const parsedData = parseCSV(csvText)
    console.log('Parsed data:', parsedData)
    setRawData(parsedData)
  } catch (error) {
    console.error('Error fetching data:', error)
    setRawData([])
  } finally {
    setLoading(false)
  }
}


  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n')
    if (!lines.length) return []

    const headers = lines[0]
      .split(',')
      .map((h) => h.trim().replace(/"/g, ''))

    const parsedData = lines.slice(1).map((line) => {
      const values = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"' && (i === 0 || line[i - 1] === ',')) {
          inQuotes = true
        } else if (
          char === '"' &&
          inQuotes &&
          (i === line.length - 1 || line[i + 1] === ',')
        ) {
          inQuotes = false
        } else if (char === ',' && !inQuotes) {
          values.push(
            current
              .trim()
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
          )
          current = ''
        } else {
          current += char
        }
      }
      values.push(
        current
          .trim()
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
      )

      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    })

    // Filter out rows that have no data or missing Date
    const cleaned = parsedData.filter((row) => {
      const hasAnyData = Object.values(row).some(
        (val) => val && val.toString().trim() !== ''
      )
      const dateVal = row.Date || row.date || row.DATE
      return hasAnyData && dateVal
    })

    return cleaned
  }

  // Helper: parse date from sheet into real Date + canonical "YYYY-MM-DD" string
  const parseRowDate = (row) => {
    const dateValue = row.Date || row.date || row.DATE
    if (!dateValue) return { dateObj: null, dateKey: null }

    const trimmed = dateValue.toString().trim()

    let dateObj = null

    // DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('-')
      dateObj = new Date(`${year}-${month}-${day}`)
    }
    // YYYY-MM-DD
    else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      dateObj = new Date(trimmed)
    } else {
      // fallback: let JS try
      const tmp = new Date(trimmed)
      if (!isNaN(tmp.getTime())) {
        dateObj = tmp
      }
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
      return { dateObj: null, dateKey: null }
    }

    const dateKey = dateObj.toISOString().slice(0, 10) // YYYY-MM-DD
    return { dateObj, dateKey }
  }

  // Filter + metrics are computed from rawData, startDate, endDate
  const { metrics, chartData } = useMemo(() => {
    if (!rawData.length) {
      return {
        metrics: {
          totalEntries: 0,
          totalCalories: 0,
          avgCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalFiber: 0,
          avgProtein: 0,
          avgFat: 0,
          avgFiber: 0,
          weeklyData: [],
          mealTypes: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
          dailyGoals: DAILY_GOALS
        },
        chartData: []
      }
    }

    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    if (start) start.setHours(0, 0, 0, 0)
    if (end) end.setHours(23, 59, 59, 999)

    const dailyCalories = {}
    let totalCalories = 0
    let totalProtein = 0
    let totalFat = 0
    let totalFiber = 0

    const mealCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
    let validEntryCount = 0

    console.log('Date filters:', { startDate, endDate, start, end })
    console.log('Raw data sample:', rawData.slice(0, 3))
    
    rawData.forEach((row, index) => {
      const { dateObj, dateKey } = parseRowDate(row)
      
      console.log(`Row ${index}:`, {
        originalDate: row.Date || row.date || row.DATE,
        parsedDate: dateObj?.toDateString(),
        dateKey,
        passesFilter: dateObj && (!start || dateObj >= start) && (!end || dateObj <= end)
      })
      
      if (!dateObj || !dateKey) return

      if (start && dateObj < start) return
      if (end && dateObj > end) return

      validEntryCount += 1

      const cal = parseFloat((row.Calories || row.Calorie || '').toString().replace(/[^0-9.]/g, '')) || 0
      const protein = parseFloat((row.Protein || '').toString().replace(/[^0-9.]/g, '')) || 0
      const fat = parseFloat((row.Fat || row.Fats || '').toString().replace(/[^0-9.]/g, '')) || 0
      const fiber = parseFloat((row.Fiber || row.Fibre || '').toString().replace(/[^0-9.]/g, '')) || 0

      totalCalories += cal
      totalProtein += protein
      totalFat += fat
      totalFiber += fiber

      dailyCalories[dateKey] = (dailyCalories[dateKey] || 0) + cal

      const mealRaw = (row.Meal || row['Meal Type'] || '').toString().toLowerCase()
      if (mealRaw.includes('breakfast')) mealCounts.breakfast += 1
      else if (mealRaw.includes('lunch')) mealCounts.lunch += 1
      else if (mealRaw.includes('dinner')) mealCounts.dinner += 1
      else if (mealRaw.includes('snack')) mealCounts.snack += 1
    })

    const weeklyDataArr = Object.entries(dailyCalories)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .slice(0, 7)
      .reverse()

    const metricsComputed = {
      totalEntries: validEntryCount,
      totalCalories: Math.round(totalCalories),
      avgCalories: validEntryCount > 0 ? Math.round(totalCalories / validEntryCount) : 0,
      totalProtein: Math.round(totalProtein),
      totalFat: Math.round(totalFat),
      totalFiber: Math.round(totalFiber),
      avgProtein: validEntryCount > 0 ? Math.round(totalProtein / validEntryCount) : 0,
      avgFat: validEntryCount > 0 ? Math.round(totalFat / validEntryCount) : 0,
      avgFiber: validEntryCount > 0 ? Math.round(totalFiber / validEntryCount) : 0,
      weeklyData: weeklyDataArr,
      mealTypes: mealCounts,
      dailyGoals: DAILY_GOALS
    }

    const chartDataComputed = weeklyDataArr.map(([dateKey, calories]) => {
      const dateObj = new Date(dateKey)
      return {
        day: dateObj.toLocaleDateString('en', { weekday: 'short' }),
        date: dateKey,
        calories
      }
    })

    return { metrics: metricsComputed, chartData: chartDataComputed }
  }, [rawData, startDate, endDate])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSheet])

  const MacroCard = ({ title, current, target, color, unit = 'g' }) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          minHeight: { xs: '90px', sm: '120px' }
        }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 1.5, sm: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={{ xs: 1, sm: 2 }}>
            <Typography 
              variant={{ xs: 'caption', sm: 'subtitle2' }} 
              color="text.secondary" 
              textTransform="uppercase" 
              fontWeight="bold"
            >
              {title}
            </Typography>
            <Chip
              label={`${Math.round(percentage)}%`}
              size="small"
              color={
                percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error'
              }
            />
          </Box>
          <Typography variant={{ xs: 'h6', sm: 'h4' }} component="div" color={color} fontWeight="bold">
            {current}
            <Typography component="span" variant={{ xs: 'caption', sm: 'body2' }} color="text.secondary" ml={1}>
              / {target}
              {unit}
            </Typography>
          </Typography>
          <Box mt={{ xs: 1, sm: 2 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{ height: { xs: 6, sm: 8 }, borderRadius: 4 }}
            />
          </Box>
        </CardContent>
      </Card>
    )
  }

  const WeeklyChart = () => {
    const handleBarClick = (_, index) => {
      const item = chartData[index]
      if (!item) return
      setStartDate(item.date)
      setEndDate(item.date)
    }

    return (
      <Card
        sx={{
          height: { xs: 'auto', lg: '100%' },
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          minHeight: { xs: '300px', sm: '350px', lg: '100%' }
        }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 1.5, sm: 2 } }}>
          <Typography variant={{ xs: 'subtitle1', sm: 'h6' }} gutterBottom>
            {startDate || endDate ? 'Filtered' : 'Weekly'} Calorie Trend
          </Typography>
          <Box sx={{ flexGrow: 1, minHeight: { xs: 250, sm: 300, lg: 250 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="day" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="calories"
                  fill="#4caf50"
                  radius={[4, 4, 0, 0]}
                  onClick={handleBarClick}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    )
  }



  const handleClearDates = () => {
    setStartDate('')
    setEndDate('')
  }

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    setEndDate(today)
  }

  const score =
    Math.round(
      ((metrics.avgCalories || 0) / (metrics.dailyGoals?.calories || 2200)) * 100
    ) || 0

  const scoreLabel =
    metrics.avgCalories > 2000 ? '🎯 Great!' : metrics.avgCalories > 1500 ? '📈 Good!' : '💪 Improve!'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        p: { xs: 1, sm: 1.5 },
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Paper elevation={2} sx={{ p: { xs: 1, sm: 1.5 }, mb: { xs: 1, sm: 1.5 }, borderRadius: 2, flexShrink: 0 }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={1.5} mb={{ xs: 2, md: 0 }}>
            <Avatar sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, bgcolor: 'primary.main' }}>
              <Restaurant fontSize="medium" />
            </Avatar>
            <Box>
              <Typography variant={{ xs: 'h6', sm: 'h5' }} component="h1" fontWeight="bold" color="primary">
                SRV Nutrition Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Smart insights from your nutrition data
              </Typography>
            </Box>
          </Box>

          <Box 
            display="flex" 
            alignItems="center" 
            gap={{ xs: 1, sm: 1.5 }} 
            flexWrap="wrap"
            justifyContent={{ xs: 'center', md: 'flex-end' }}
          >
            <FormControl size="small" sx={{ minWidth: { xs: 80, sm: 100 } }}>
              <InputLabel>Sheet</InputLabel>
              <Select
                value={selectedSheet}
                label="Sheet"
                onChange={(e) => setSelectedSheet(e.target.value)}
              >
                <MenuItem value="sheet1">Sheet 1</MenuItem>
                <MenuItem value="sheet2">Sheet 2</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="Start"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: { xs: 110, sm: 140 } }}
            />

            <TextField
              size="small"
              type="date"
              label="End"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: { xs: 110, sm: 140 } }}
            />

            <Button variant="outlined" size="small" onClick={handleClearDates} sx={{ minWidth: { xs: 60, sm: 'auto' } }}>
              Clear
            </Button>

            <Button variant="outlined" size="small" onClick={handleToday} sx={{ minWidth: { xs: 60, sm: 'auto' } }}>
              Today
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              onClick={fetchData}
              disabled={loading}
              sx={{ minWidth: { xs: 80, sm: 'auto' } }}
            >
              {loading ? 'Load' : 'Refresh'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
          <CircularProgress size={80} />
          <Typography variant="h6" color="primary" mt={3}>
            Analyzing your nutrition data...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Macro Cards - Responsive Grid */}
          <Box
            display="grid"
            gridTemplateColumns={{ 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(4, 1fr)' 
            }}
            gap={{ xs: 1, sm: 1.5 }}
            sx={{ mb: { xs: 1, sm: 1.5 }, minHeight: { xs: '200px', sm: '120px' } }}
          >
            <MacroCard
              title="Calories"
              current={metrics.totalCalories || 0}
              target={metrics.dailyGoals?.calories || 2200}
              color="error.main"
              unit=" kcal"
            />
            <MacroCard
              title="Protein"
              current={metrics.totalProtein || 0}
              target={metrics.dailyGoals?.protein || 120}
              color="primary.main"
            />
            <MacroCard
              title="Fiber"
              current={metrics.totalFiber || 0}
              target={metrics.dailyGoals?.fiber || 25}
              color="success.main"
            />
            <MacroCard
              title="Fat"
              current={metrics.totalFat || 0}
              target={metrics.dailyGoals?.fat || 73}
              color="secondary.main"
            />
          </Box>

          {/* Main Content Grid - Responsive */}
          <Box
            display="grid"
            gridTemplateColumns={{ 
              xs: '1fr', 
              lg: '1.8fr 1.2fr' 
            }}
            gap={{ xs: 1.5, sm: 2 }}
            sx={{ 
              flexGrow: 1, 
              minHeight: { xs: 'auto', lg: 0 }, 
              height: { xs: 'auto', lg: 'calc(100vh - 200px)' } 
            }}
          >
            {/* Chart - Full width on mobile, left on desktop */}
            <WeeklyChart />

            {/* Summary Cards - Stack on mobile, grid on desktop */}
            <Box 
              display="grid" 
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} 
              gap={{ xs: 1.5, sm: 3 }} 
              sx={{ height: { xs: 'auto', lg: '100%' } }}
            >
                <Card
                  sx={{
                    height: { xs: 'auto', lg: '100%' },
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    minHeight: { xs: '200px', sm: '250px' }
                  }}
                >
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: { xs: 2, sm: 3 }, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-evenly' 
                  }}>
                    <Typography variant={{ xs: 'subtitle1', sm: 'h6' }} fontWeight="bold" textAlign="center" mb={{ xs: 2, sm: 3 }}>
                      Summary
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={{ xs: 1, sm: 1.5 }}>
                      <Typography variant={{ xs: 'body2', sm: 'body1' }} color="text.secondary" fontWeight="medium">
                        Entries
                      </Typography>
                      <Typography
                        variant={{ xs: 'subtitle1', sm: 'h6' }}
                        fontWeight="bold"
                        color="primary"
                      >
                        {metrics.totalEntries || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={{ xs: 1, sm: 1.5 }}>
                      <Typography variant={{ xs: 'body2', sm: 'body1' }} color="text.secondary" fontWeight="medium">
                        Total Cal
                      </Typography>
                      <Typography variant={{ xs: 'subtitle1', sm: 'h6' }} fontWeight="bold" color="error">
                        {metrics.totalCalories || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={{ xs: 1, sm: 1.5 }}>
                      <Typography variant={{ xs: 'body2', sm: 'body1' }} color="text.secondary" fontWeight="medium">
                        Avg Cal
                      </Typography>
                      <Typography
                        variant={{ xs: 'subtitle1', sm: 'h6' }}
                        fontWeight="bold"
                        color="warning.main"
                      >
                        {metrics.avgCalories || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={{ xs: 1, sm: 1.5 }}>
                      <Typography variant={{ xs: 'body2', sm: 'body1' }} color="text.secondary" fontWeight="medium">
                        Days
                      </Typography>
                      <Typography
                        variant={{ xs: 'subtitle1', sm: 'h6' }}
                        fontWeight="bold"
                        color="primary"
                      >
                        {metrics.weeklyData?.length || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    height: { xs: 'auto', lg: '100%' },
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    minHeight: { xs: '150px', sm: '200px' }
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: 'center',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      p: { xs: 1.5, sm: 2 }
                    }}
                  >
                    <Typography variant={{ xs: 'caption', sm: 'subtitle2' }} gutterBottom>
                      Score
                    </Typography>
                    <Typography
                      variant={{ xs: 'h4', sm: 'h3' }}
                      component="div"
                      fontWeight="bold"
                      mb={0.5}
                    >
                      {score}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }} mb={1}>
                      Health Rating
                    </Typography>
                    <Typography variant={{ xs: 'caption', sm: 'body2' }}>{scoreLabel}</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </>
        )}
    </Box>
  )
}

export default Dashboard
