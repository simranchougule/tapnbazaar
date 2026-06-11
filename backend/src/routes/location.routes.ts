import { Router } from 'express'
import {
  getStates,
  getCities,
  getLocalities,
  searchLocations,
  getPopularLocalities,
  getLocalityStats,
} from '../controllers/location.controller'

const router = Router()

router.get('/states',          getStates)
router.get('/cities',          getCities)
router.get('/localities',      getLocalities)
router.get('/search',          searchLocations)
router.get('/popular',         getPopularLocalities)
router.get('/locality-stats',  getLocalityStats)

export default router
