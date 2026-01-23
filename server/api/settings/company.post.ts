
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const { companyName, description } = await readBody(event)

    const db = await useDb()

    // Permission Check: Only Owner can update Company Settings
    if (memberId) {
        const member = db.data.members.find(m => m.id === memberId && m.license_key === licenseKey)
        if (!member || member.role !== 'Owner') {
            throw createError({ statusCode: 403, message: 'Bạn không có quyền thay đổi thông tin công ty' })
        }
    }

    if (!Array.isArray(db.data.settings)) {
        db.data.settings = []
    }

    let settingsIndex = db.data.settings.findIndex(s => s.license_key === licenseKey && !s.member_id)
    if (settingsIndex === -1) {
        db.data.settings.push({ license_key: licenseKey })
        settingsIndex = db.data.settings.length - 1
    }

    if (companyName !== undefined) db.data.settings[settingsIndex].companyName = companyName
    if (description !== undefined) db.data.settings[settingsIndex].description = description

    await db.write()

    return { success: true }
})
