import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from project root
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  quiet: true,
})

export { CodeGuide } from './codeguide'
export * from './services'
export * from './types'
