import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
    const path = event.context.params?.path || ''

    // Security: prevent directory traversal
    if (path.includes('..') || path.includes('~')) {
        throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Try to read from public/uploads first (runtime uploads)
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadsDir, path)

    if (!existsSync(filepath)) {
        throw createError({ statusCode: 404, message: 'File not found' })
    }

    try {
        const file = await readFile(filepath)

        // Determine content type based on file extension
        const ext = path.split('.').pop()?.toLowerCase()
        const contentTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
        }

        const contentType = contentTypes[ext || ''] || 'application/octet-stream'

        event.node.res.setHeader('Content-Type', contentType)
        event.node.res.setHeader('Cache-Control', 'public, max-age=31536000')

        return file
    } catch (error) {
        throw createError({ statusCode: 500, message: 'Error reading file' })
    }
})
