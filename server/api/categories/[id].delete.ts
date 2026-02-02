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

    // Only Owner can delete categories
    if (memberId) {
        const member = db.data.members.find(m => m.id === memberId && m.license_key === licenseKey)
        if (!member || member.role !== 'Owner') {
            throw createError({
                statusCode: 403,
                message: 'Forbidden: Only Owner can delete categories'
            })
        }
    }

    // Find the category
    const category = db.data.categories.find(
        c => c.id === categoryId && c.license_key === licenseKey
    )

    if (!category) {
        throw createError({
            statusCode: 404,
            message: 'Category not found'
        })
    }

    // Check if it's a default category
    if (category.is_default) {
        throw createError({
            statusCode: 400,
            message: 'Không thể xóa danh mục mặc định'
        })
    }

    // Check if category is in use by any tasks
    const tasksUsingCategory = db.data.tasks.filter(
        t => t.license_key === licenseKey && t.category === category.id
    )

    if (tasksUsingCategory.length > 0) {
        throw createError({
            statusCode: 400,
            message: `Không thể xóa danh mục đang được sử dụng bởi ${tasksUsingCategory.length} nhiệm vụ`
        })
    }

    // Remove the category
    db.data.categories = db.data.categories.filter(c => c.id !== categoryId)
    await db.write()

    return {
        success: true,
        message: 'Category deleted successfully'
    }
})
