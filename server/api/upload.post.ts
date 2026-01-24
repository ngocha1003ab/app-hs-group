import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const form = await readMultipartFormData(event)

    if (!form || form.length === 0) {
        throw createError({ statusCode: 400, message: 'No file uploaded' })
    }

    const file = form[0]

    if (!file.filename || !file.data) {
        throw createError({ statusCode: 400, message: 'Invalid file' })
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type || '')) {
        throw createError({ statusCode: 400, message: 'Only image files are allowed' })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.data.length > maxSize) {
        throw createError({ statusCode: 400, message: 'File size must be less than 5MB' })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.filename.split('.').pop()
    const filename = `${timestamp}-${randomStr}.${ext}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, file.data)

    // Return public URL
    const publicUrl = `/uploads/${filename}`

    return {
        success: true,
        url: publicUrl
    }
})
