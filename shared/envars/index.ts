import { protectedEnv, publicEnv } from './variables'
export { publicEnv, protectedEnv }
export type PublicEnv = typeof publicEnv
export type ProtectedEnv = typeof protectedEnv
