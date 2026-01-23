
import { validateLicenseKey } from '../../utils/license'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { licenseKey } = body

    if (!licenseKey) {
        throw createError({
            statusCode: 400,
            message: 'Vui lòng nhập mã giấy phép'
        })
    }

    // 1. Validate with external API
    const validationResult = await validateLicenseKey(licenseKey)

    if (!validationResult.success || !validationResult.data) {
        throw createError({
            statusCode: 401,
            message: validationResult.message || 'Mã giấy phép không hợp lệ hoặc đã hết hạn.'
        })
    }

    // 2. Save/Update in Local DB
    const db = await useDb()
    const licenseInfo = validationResult.data

    const existingLicenseIndex = db.data.licenses.findIndex((l: any) => l.key_license === licenseInfo.key_license)

    const newLicenseRecord = {
        ...licenseInfo,
        added_at: new Date().toISOString()
    }

    if (existingLicenseIndex >= 0) {
        // Update existing
        db.data.licenses[existingLicenseIndex] = newLicenseRecord
    } else {
        // Add new
        db.data.licenses.push(newLicenseRecord)
    }

    await db.write()

    // 3. Set Session Cookie
    setCookie(event, 'license_key', licenseInfo.key_license, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: false, // Accessible by JS if needed, but mainly for server ID
        path: '/',
        sameSite: 'lax'
    })

    return {
        success: true,
        user: licenseInfo
    }
})
