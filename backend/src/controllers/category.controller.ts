// src/controllers/category.controller.ts
import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
    res.status(200).json({ success: true, categories })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}