import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import documentsRouter from './routes/documents'
import chatRouter from './routes/chat'
import quizRouter from './routes/quiz'
import examRouter from './routes/exam'
import analyticsRouter from './routes/analytics'
import historyRouter from './routes/history'
import gamificationRouter from './routes/gamification'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/documents', documentsRouter)
app.use('/api/chat', chatRouter)
app.use('/api/quiz', quizRouter)
app.use('/api/exam', examRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/history', historyRouter)
app.use('/api/gamification', gamificationRouter)

app.listen(PORT, () => {
  console.log(`LECTOR backend running on http://localhost:${PORT}`)
})

export default app
