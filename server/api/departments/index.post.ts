
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    const body = await readBody(event)
    const { name, description } = body

    if (!name) {
        throw createError({
            statusCode: 400,
            message: 'Tên phòng ban là bắt buộc'
        })
    }

    const db = await useDb()

    // Safety check: ensure arrays exist (migrating old DBs)
    db.data.departments = db.data.departments || []
    db.data.members = db.data.members || []

    const newDepartment = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name,
        description: description || '',
        license_key: licenseKey,
        created_at: new Date().toISOString()
    }

    db.data.departments.push(newDepartment)
    await db.write()

    return {
        success: true,
        data: {
            ...newDepartment,
            members: [] // Return empty members array for consistency with GET response
        }
    }
})
