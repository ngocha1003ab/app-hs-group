
import { JSONFilePreset } from 'lowdb/node'

export interface LicenseData {
    id: number
    key_license: string
    expired_at: string | null
    product_id: number
    email: string
    status: number
    added_at: string // When it was added to our local DB
}

export interface DatabaseSchema {
    licenses: LicenseData[]
    settings: {
        companyName?: string
        description?: string
    }
}

const defaultData: DatabaseSchema = {
    licenses: [],
    settings: {}
}

export const useDb = async () => {
    // Use a file named db.json in the project root
    const db = await JSONFilePreset<DatabaseSchema>('db.json', defaultData)
    return db
}
