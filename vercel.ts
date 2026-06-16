import { type VercelConfig } from '@vercel/config'

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  installCommand: 'npm install',
}
