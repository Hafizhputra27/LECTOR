import { Request, Response, NextFunction } from 'express'
import { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '../services/supabase'

// Augment Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.slice(7)

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  req.user = data.user
  next()
}
