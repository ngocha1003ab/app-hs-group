
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const id = getRouterParam(event, 'id')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Missing department ID'
        })
    }

    const body = await readBody(event)
    const { name, description } = body

    if (!name) {
        throw createError({
            statusCode: 400,
            message: 'Tên phòng ban là bắt buộc'
        })
    }

    const db = await useDb()

    const index = db.data.departments.findIndex(d => d.id === id && d.license_key === licenseKey)

    if (index === -1) {
        throw createError({
            statusCode: 404,
            message: 'Phòng ban không tồn tại hoặc bạn không có quyền chỉnh sửa'
        })
    }

    // Update
    const updatedDept = {
        ...db.data.departments[index],
        name,
        description: description || '',
        // Keep original id, license_key, created_at
    }

    db.data.departments[index] = updatedDept
    await db.write()

    return {
        success: true,
        data: updatedDept
    }
})
