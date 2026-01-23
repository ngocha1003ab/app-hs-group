
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

    const body = await readBody(event)
    const { name, email, phone, isManager, password } = body

    const db = await useDb()

    const index = db.data.members.findIndex(m => m.id === id && m.license_key === licenseKey)

    if (index === -1) {
        throw createError({
            statusCode: 404,
            message: 'Nhân viên không tồn tại'
        })
    }

    const currentMember = db.data.members[index]

    const updatedMember = {
        ...currentMember,
        name: name || currentMember.name,
        email: email || currentMember.email,
        phone: phone || currentMember.phone,
        role: isManager !== undefined ? (isManager ? 'Leader' : 'Member') : currentMember.role,
        password: password ? password : (currentMember as any).password // Update password only if provided
    }

    db.data.members[index] = updatedMember
    await db.write()

    return {
        success: true,
        data: updatedMember
    }
})
