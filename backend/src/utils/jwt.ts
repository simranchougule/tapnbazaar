import jwt from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
  email: string
  tokenVersion: number
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET as string
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign(
    { userId: payload.userId, email: payload.email, tokenVersion: payload.tokenVersion },
    secret,
    { expiresIn: expiresIn as any }
  )
}

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET as string
  return jwt.verify(token, secret) as TokenPayload
}
