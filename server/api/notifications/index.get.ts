
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const userId = memberId || 'owner' // Current user

    const db = await useDb()
    db.data.notifications = db.data.notifications || []

    // Fetch notifications for THIS user in THIS license
    const notifications = db.data.notifications.filter(n => n.user_id === userId && n.license_key === licenseKey)

    // Sort newest first
    return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})
