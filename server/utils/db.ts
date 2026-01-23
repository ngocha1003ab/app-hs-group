
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

export interface Department {
    id: string
    name: string
    description?: string
    license_key: string
    created_at: string
}

export interface Member {
    id: string
    name: string
    email?: string
    phone?: string
    avatar?: string
    role: 'Leader' | 'Member'
    department_id: string
    license_key: string
    created_at: string
}

export interface DatabaseSchema {
    licenses: LicenseData[]
    departments: Department[]
    members: Member[]
    settings: {
        companyName?: string
        description?: string
    }
}

const defaultData: DatabaseSchema = {
    licenses: [],
    departments: [],
    members: [],
    settings: {}
}

export const useDb = async () => {
    // Use a file named db.json in the project root
    const db = await JSONFilePreset<DatabaseSchema>('db.json', defaultData)
    return db
}
