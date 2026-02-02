import { useDb, Category } from '../../utils/db'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    // Only Owner can create categories
    const db = await useDb()
    if (memberId) {
        const member = db.data.members.find(m => m.id === memberId && m.license_key === licenseKey)
        if (!member || member.role !== 'Owner') {
            throw createError({
                statusCode: 403,
                message: 'Forbidden: Only Owner can create categories'
            })
        }
    }

    const body = await readBody(event)

    if (!body.name || !body.icon || !body.color) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request: name, icon, and color are required'
        })
    }

    // Check for duplicate name
    const existingName = db.data.categories.find(
        c => c.license_key === licenseKey && c.name.toLowerCase() === body.name.toLowerCase()
    )
    if (existingName) {
        throw createError({
            statusCode: 400,
            message: 'Danh mục với tên này đã tồn tại'
        })
    }

    const newCategory: Category = {
        id: `cat_${randomUUID()}`,
        name: body.name,
        icon: body.icon,
        color: body.color,
        license_key: licenseKey,
        is_default: false,
        created_at: new Date().toISOString()
    }

    db.data.categories.push(newCategory)
    await db.write()

    return {
        success: true,
        data: newCategory
    }
})
