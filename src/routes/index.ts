import { Express } from 'express'
import videoRouter from './video'

export default function routeConfig(app: Express) {
  app.use('/video', videoRouter)
}