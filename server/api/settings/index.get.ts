
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    // Optional: Check if logged in 
    const licenseKey = getCookie(event, 'license_key')
    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const db = await useDb()
    if (!Array.isArray(db.data.settings)) {
        db.data.settings = []
    }
    const settings = db.data.settings.find(s => s.license_key === licenseKey && !s.member_id) || {} as any

    return {
        companyName: settings.companyName || '',
        description: settings.description || ''
    }
})
