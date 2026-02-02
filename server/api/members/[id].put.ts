
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
    const { name, username: rawUsername, email, phone, role, password } = body

    const db = await useDb()

    const index = db.data.members.findIndex(m => m.id === id && m.license_key === licenseKey)

    if (index === -1) {
        throw createError({
            statusCode: 404,
            message: 'Nhân viên không tồn tại'
        })
    }

    const currentMember = db.data.members[index]

    // Sanitize username if provided: lowercase, no spaces, alphanumeric only
    let username = rawUsername
        ? rawUsername.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
        : (currentMember as any).username

    if (rawUsername && username.length < 3) {
        throw createError({
            statusCode: 400,
            message: 'Tên đăng nhập phải có ít nhất 3 ký tự'
        })
    }

    // Check for duplicate username if username is being changed
    if (username && username !== (currentMember as any).username) {
        const existingUsername = db.data.members.find(
            m => m.license_key === licenseKey &&
                m.id !== id &&
                (m as any).username === username
        )
        if (existingUsername) {
            throw createError({
                statusCode: 409,
                message: 'Tên đăng nhập đã tồn tại'
            })
        }
    }

    // Validate role if provided
    const validRoles = ['Member', 'Leader', 'Owner']
    let newRole = role && validRoles.includes(role) ? role : currentMember.role

    // Check editor's role - Leaders cannot change roles
    const editorId = getCookie(event, 'member_id')
    if (editorId) {
        const editor = db.data.members.find(m => m.id === editorId && m.license_key === licenseKey)
        if (editor && editor.role === 'Leader') {
            // Leaders cannot change roles - keep original
            newRole = currentMember.role
        }
    }

    const updatedMember = {
        ...currentMember,
        name: name || currentMember.name,
        username: username || (currentMember as any).username,
        email: email !== undefined ? email : currentMember.email,
        phone: phone !== undefined ? phone : currentMember.phone,
        role: newRole,
        password: password ? password : (currentMember as any).password // Update password only if provided
    }

    db.data.members[index] = updatedMember
    await db.write()

    return {
        success: true,
        data: updatedMember
    }
})
