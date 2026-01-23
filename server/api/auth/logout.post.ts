
export default defineEventHandler((event) => {
    deleteCookie(event, 'license_key')
    deleteCookie(event, 'member_id')
    deleteCookie(event, 'member_role')
    // Clear the specific cookie used by useLicense composable
    deleteCookie(event, 'license_data')

    return { success: true }
})
