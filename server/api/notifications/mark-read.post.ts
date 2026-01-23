
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')
    const body = await readBody(event) // { id?: string }

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const userId = memberId || 'owner'
    const db = await useDb()

    if (body?.id) {
        // Mark specific
        const notif = db.data.notifications.find(n => n.id === body.id && n.user_id === userId && n.license_key === licenseKey)
        if (notif) {
            notif.read = true
            await db.write()
        }
    } else {
        // Mark all as read
        let updated = false
        db.data.notifications.forEach(n => {
            if (n.user_id === userId && n.license_key === licenseKey && !n.read) {
                n.read = true
                updated = true
            }
        })
        if (updated) {
            await db.write()
        }
    }

    return { success: true }
})
