
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    const db = await useDb()

    // Safety check
    db.data.members = db.data.members || []

    // Filter members by license key
    const members = db.data.members.filter(m => m.license_key === licenseKey)

    // Sort by newest first
    return members.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})
