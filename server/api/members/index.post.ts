
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
    const { name, department_id, username, password, email, phone, isManager } = body

    if (!name || !department_id || !username || !password) {
        throw createError({
            statusCode: 400,
            message: 'Thiếu thông tin bắt buộc (Tên, Phòng ban, Username, Password)'
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

    const newMember = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name,
        username, // Add to schema if needed or just store in object if NoSQL flexibility allowed 
        password, // In real app, HASH THIS!
        email: email || '',
        phone: phone || '',
        department_id,
        role: isManager ? 'Leader' : 'Member',
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
