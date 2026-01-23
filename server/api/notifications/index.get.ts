
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const db = await useDb()
    db.data.notifications = db.data.notifications || []

    let targetIds = [memberId || 'owner']

    // If we have a memberId, check if they are the Owner
    if (memberId) {
        const member = db.data.members.find(m => m.id === memberId && m.license_key === licenseKey)
        if (member && member.role === 'Owner') {
            // If they are Owner, they should receive notifications for specific ID AND 'owner' alias
            targetIds.push('owner')
        }
    }

    // Fetch notifications for THIS user (or alias) in THIS license
    const notifications = db.data.notifications.filter(n => targetIds.includes(n.user_id) && n.license_key === licenseKey)

    // Sort newest first
    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Pagination
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const total = notifications.length

    const start = (page - 1) * limit
    const paginatedNotifications = notifications.slice(start, start + limit)

    return {
        data: paginatedNotifications,
        total,
        page,
        limit
    }
})
