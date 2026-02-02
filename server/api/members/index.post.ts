
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    const body = await readBody(event)
    const { name, department_id, username: rawUsername, password, email, phone, role } = body

    if (!name || !department_id || !rawUsername || !password) {
        throw createError({
            statusCode: 400,
            message: 'Thiếu thông tin bắt buộc (Tên, Phòng ban, Username, Password)'
        })
    }

    // Sanitize username: lowercase, no spaces, alphanumeric only
    const username = rawUsername.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')

    if (username.length < 3) {
        throw createError({
            statusCode: 400,
            message: 'Tên đăng nhập phải có ít nhất 3 ký tự'
        })
    }

    const db = await useDb()

    // Safety check
    db.data.members = db.data.members || []

    // Check for duplicate username within the same license (optional but good practice)
    const existing = db.data.members.find(m => m.license_key === licenseKey && (m as any).username === username)
    if (existing) {
        throw createError({
            statusCode: 409,
            message: 'Tên đăng nhập đã tồn tại'
        })
    }

    // Validate role
    const validRoles = ['Member', 'Leader', 'Owner']
    let memberRole = validRoles.includes(role) ? role : 'Member'

    // Check creator's role - Leaders can only create Members
    const memberId = getCookie(event, 'member_id')
    if (memberId) {
        const currentUser = db.data.members.find(m => m.id === memberId && m.license_key === licenseKey)
        if (currentUser && currentUser.role === 'Leader') {
            // Leaders can only create Members
            if (role !== 'Member') {
                memberRole = 'Member' // Force to Member if Leader tries to create Leader/Owner
            }
        }
    }

    const newMember = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name,
        username,
        password, // In real app, HASH THIS!
        email: email || '',
        phone: phone || '',
        department_id,
        role: memberRole,
        license_key: licenseKey,
        created_at: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    }

    // TS hack since username/password aren't in shared interface yet but we need them for Auth later
    // In a real strict TS setup, update the interface in db.ts
    db.data.members.push(newMember as any)
    await db.write()

    return {
        success: true,
        data: newMember
    }
})
