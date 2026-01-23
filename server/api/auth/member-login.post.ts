
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
        throw createError({
            statusCode: 400,
            message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
        })
    }

    const db = await useDb()

    // Find member by username and password (Global Search)
    // Note: In a real app, password should be hashed. Here we compare plain text as stored.
    // We filter matches.
    const matches = db.data.members.filter((m: any) => m.username === username && m.password === password)

    if (matches.length === 0) {
        throw createError({
            statusCode: 401,
            message: 'Tên đăng nhập hoặc mật khẩu không đúng'
        })
    }

    if (matches.length > 1) {
        throw createError({
            statusCode: 409,
            message: 'Tài khoản không duy nhất. Vui lòng liên hệ quản trị viên.'
        })
    }

    const member = matches[0]

    // Set Cookies
    // 1. License Key (Critical for app scoping)
    setCookie(event, 'license_key', member.license_key, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: false,
        path: '/',
        sameSite: 'lax'
    })

    // 2. Member ID (To identify specific user)
    setCookie(event, 'member_id', member.id, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: false,
        path: '/',
        sameSite: 'lax'
    })

    // 3. Member Role (For easier client-side menu filtering, usually signed/encrypted but plain here for simplicity)
    setCookie(event, 'member_role', member.role, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: false,
        path: '/',
        sameSite: 'lax'
    })

    return {
        success: true,
        member: {
            id: member.id,
            name: member.name,
            role: member.role,
            license_key: member.license_key
        }
    }
})
