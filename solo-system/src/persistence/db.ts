import Dexie, { type Table } from 'dexie'
import type { SaveState } from '../domain/types'

export interface SaveRow { key: string; state: SaveState }

export class SystemDB extends Dexie {
  saves!: Table<SaveRow, string>
  constructor() {
    super('solo-system')
    this.version(1).stores({ saves: 'key' })
  }
}

export const db = new SystemDB()
export const SAVE_KEY = 'primary'
