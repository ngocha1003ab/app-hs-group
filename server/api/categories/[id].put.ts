import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')
    const categoryId = getRouterParam(event, 'id')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    if (!categoryId) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request: Category ID is required'
        })
    }

    const db = await useDb()

    // Only Owner can update categories
    if (memberId) {
        const member = db.data.members.find(m => m.id === memberId && m.license_key === licenseKey)
        if (!member || member.role !== 'Owner') {
            throw createError({
                statusCode: 403,
                message: 'Forbidden: Only Owner can update categories'
            })
        }
    }

    // Find the category
    const categoryIndex = db.data.categories.findIndex(
        c => c.id === categoryId && c.license_key === licenseKey
    )

    if (categoryIndex === -1) {
        throw createError({
            statusCode: 404,
            message: 'Category not found'
        })
    }

    const body = await readBody(event)

    // Check for duplicate name (excluding current category)
    if (body.name) {
        const existingName = db.data.categories.find(
            c => c.license_key === licenseKey &&
                c.name.toLowerCase() === body.name.toLowerCase() &&
                c.id !== categoryId
        )
        if (existingName) {
            throw createError({
                statusCode: 400,
                message: 'Danh mục với tên này đã tồn tại'
            })
        }
    }

    // Update category
    const category = db.data.categories[categoryIndex]
    if (body.name) category.name = body.name
    if (body.icon) category.icon = body.icon
    if (body.color) category.color = body.color

    await db.write()

    return {
        success: true,
        data: category
    }
})
