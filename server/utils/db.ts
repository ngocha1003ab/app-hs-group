
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
    username?: string
    password?: string
    email?: string
    phone?: string
    avatar?: string
    role: 'Leader' | 'Member'
    department_id: string
    license_key: string
    created_at: string
}

export interface Task {
    id: string
    title: string
    description?: string
    assignee_id: string
    department_id: string
    priority: 'low' | 'medium' | 'high'
    status: 'todo' | 'in-progress' | 'done'
    due_date: string
    license_key: string
    created_at: string
    updated_at: string
}

export interface Comment {
    id: string
    task_id: string
    user_id: string
    content: string
    license_key: string
    created_at: string
}

export interface Notification {
    id: string
    user_id: string // 'owner' or member ID
    title: string
    description: string
    type: 'task_assigned' | 'task_updated' | 'comment_added' | 'other'
    link?: string    // Optional link to resource (e.g. /tasks/123)
    read: boolean
    license_key: string
    created_at: string
}

export interface DatabaseSchema {
    licenses: LicenseData[]
    departments: Department[]
    members: Member[]
    tasks: Task[]
    comments: Comment[]
    notifications: Notification[]
    settings: {
        license_key: string
        member_id?: string // If set, settings apply to this member. If undefined, applies to company/owner.

        // Company Info
        companyName?: string
        description?: string

        // Profile Info
        name?: string
        username?: string
        password?: string
        avatar?: string
        phone?: string
        email?: string
    }[]
}

const defaultData: DatabaseSchema = {
    licenses: [],
    departments: [],
    members: [],
    tasks: [],
    comments: [],
    notifications: [],
    settings: []
}

export const useDb = async () => {
    // Use a file named db.json in the project root
    const db = await JSONFilePreset<DatabaseSchema>('db.json', defaultData)
    return db
}
