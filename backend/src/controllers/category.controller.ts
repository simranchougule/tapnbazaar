import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { withCache } from '../lib/cache'

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    // Categories change rarely (admin-managed), so a longer TTL is safe
    // here and saves a query + join on nearly every page load site-wide
    // (home, categories, category landing pages all call this).
    const categories = await withCache('categories:all', 3_600_000, () =>
      prisma.category.findMany({
        where:   { parentId: null },
        orderBy: { name: 'asc' },
        include: { children: { orderBy: { name: 'asc' } } }
      })
    )
    res.status(200).json({ success: true, categories })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const getCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = String(req.params.slug)
    const category = await prisma.category.findUnique({
      where:   { slug },
      include: { children: { orderBy: { name: 'asc' } } }
    })
    if (!category) { res.status(404).json({ success: false, message: 'Category not found' }); return }
    res.status(200).json({ success: true, category })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}