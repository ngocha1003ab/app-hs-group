import { useDb } from '../../utils/db'

import { startOfDay, startOfYesterday, subDays, endOfDay, format, isSameDay } from 'date-fns'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')
    const query = getQuery(event)
    const period = (query.period as string) || '7days'

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const db = await useDb()

    // 1. Filter Tasks by Permission
    let tasks = db.data.tasks.filter(t => t.license_key === licenseKey)
    const members = db.data.members.filter(m => m.license_key === licenseKey)
    const departments = db.data.departments.filter(d => d.license_key === licenseKey)

    if (memberId) {
        const member = members.find(m => m.id === memberId)
        if (member) {
            if (member.role === 'Leader') {
                tasks = tasks.filter(t => t.department_id === member.department_id)
            } else if (member.role === 'Member') {
                tasks = tasks.filter(t => t.assignee_id === memberId)
            }
        }
    }

    // 2. Determine Date Range
    const now = new Date()
    let startDate = subDays(now, 7)
    let endDate = endOfDay(now)


    switch (period) {
        case 'today':
            startDate = startOfDay(now)
            break
        case 'yesterday':
            startDate = startOfYesterday()
            endDate = endOfDay(subDays(now, 1))
            break
        case '7days':
            startDate = subDays(now, 6) // Include today
            break
        case '1month':
            startDate = subDays(now, 29)
            break
    }

    // 3. Stats Calculation (Filtered by Period)


    // Note: For "In Progress", usually user wants Current Status regardless of creation date,
    // but typically dashboards show "Activity in this period". 
    // We will stick to the logic:
    // Total: Created in period
    // Completed: Updated to 'done' in period (Approximated by updated_at if status is done)
    // InProgress: Updated to 'in-progress' in period OR currently In Progress and created in period?
    // Let's use a simpler "Snapshot" approach for InProgress/Overdue matching the period filter context where possible,
    // but usually Overdue is "Currently Overdue".

    // Relaxed Logic for Stats Cards to be more useful:
    // Total: Created in Period
    // Completed: Status Done AND Updated in Period
    // In Progress: Status In Progress (Global snapshot? Or Updated in Period? Let's go with Global matching the Permission Scope, because "How many in progress yesterday?" is hard.)
    // WAIT, if the user toggles 'Yesterday', showing 'Current In Progress' is confusing.
    // Let's strictly filter everything by the period for "Activity".

    // Revised Logic based on typical "Performance" dashboards:
    // Total: Created in this range.
    // Completed: Completed in this range (updated_at).
    // In Progress: Currently in progress (Snapshot - ignoring date filter, or maybe tasks active in range? Hard to trace.)
    // Let's trust the "Created/Updated" timestamps.

    const total = tasks.filter(t => new Date(t.created_at) >= startDate && new Date(t.created_at) <= endDate).length
    const completed = tasks.filter(t => t.status === 'done' && new Date(t.updated_at) >= startDate && new Date(t.updated_at) <= endDate).length

    // For In Progress, we'll count tasks that were either created in this period and are still in progress, 
    // OR updated in this period and are in progress.
    const inProgress = tasks.filter(t => t.status === 'in-progress' && new Date(t.updated_at) >= startDate && new Date(t.updated_at) <= endDate).length

    // For Overdue: Tasks due in this period that are not done.
    const overdue = tasks.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) >= startDate && new Date(t.due_date) <= endDate && new Date(t.due_date) < now).length


    // 4. Chart Data Construction
    // Labels & Buckets
    let labels: string[] = []
    const completedData: number[] = []
    const inProgressData: number[] = []
    const overdueData: number[] = []

    if (period === 'today' || period === 'yesterday') {
        // Full 24-hour buckets: 0h to 23h
        const hours = Array.from({ length: 24 }, (_, i) => i)
        labels = hours.map(h => `${h}h`)

        // Use the correct reference date for buckets
        const referenceDate = period === 'today' ? now : subDays(now, 1)

        hours.forEach(h => {
            // Bucket range: [h:00, h+1:00)
            const bucketStart = new Date(referenceDate)
            bucketStart.setHours(h, 0, 0, 0)
            const bucketEnd = new Date(referenceDate)
            bucketEnd.setHours(h + 1, 0, 0, 0)

            completedData.push(tasks.filter(t => t.status === 'done' && new Date(t.updated_at) >= bucketStart && new Date(t.updated_at) < bucketEnd).length)
            inProgressData.push(tasks.filter(t => t.status === 'in-progress' && new Date(t.updated_at) >= bucketStart && new Date(t.updated_at) < bucketEnd).length)
            overdueData.push(tasks.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) >= bucketStart && new Date(t.due_date) < bucketEnd && new Date(t.due_date) < now).length)
        })

    } else if (period === '7days') {
        // Daily buckets
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate)
            d.setDate(d.getDate() + i)
            const label = format(d, 'dd/MM')
            labels.push(label)

            completedData.push(tasks.filter(t => t.status === 'done' && isSameDay(new Date(t.updated_at), d)).length)
            inProgressData.push(tasks.filter(t => t.status === 'in-progress' && isSameDay(new Date(t.updated_at), d)).length)
            overdueData.push(tasks.filter(t => t.status !== 'done' && t.due_date && isSameDay(new Date(t.due_date), d) && new Date(t.due_date) < now).length)
        }
    } else {
        // 1month - Weeks (approx 4 weeks)
        // Only doing 4 simplistic buckets for visual consistency with mock
        for (let i = 0; i < 4; i++) {
            labels.push(`Tuần ${i + 1}`)
            // Simplistic distribution logic or accurate week calc? 
            // Let's just create 4 chunks of 7 days from start date
            const bucketStart = new Date(startDate)
            bucketStart.setDate(bucketStart.getDate() + (i * 7))
            const bucketEnd = new Date(bucketStart)
            bucketEnd.setDate(bucketEnd.getDate() + 7)

            completedData.push(tasks.filter(t => t.status === 'done' && new Date(t.updated_at) >= bucketStart && new Date(t.updated_at) < bucketEnd).length)
            inProgressData.push(tasks.filter(t => t.status === 'in-progress' && new Date(t.updated_at) >= bucketStart && new Date(t.updated_at) < bucketEnd).length)
            overdueData.push(tasks.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) >= bucketStart && new Date(t.due_date) < bucketEnd).length)
        }
    }

    // 5. Overdue Tasks List (Global overdue, ignoring period? Or period specific? 
    // Usually "Actionable Now" list. So Global Overdue is best.)
    const allOverdue = tasks
        .filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) < now)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 10)
        .map(t => {
            const assignee = members.find(m => m.id === t.assignee_id)
            const dept = departments.find(d => d.id === t.department_id)
            const daysOverdue = Math.ceil((now.getTime() - new Date(t.due_date).getTime()) / (1000 * 60 * 60 * 24))
            return {
                id: t.id,
                name: t.title,
                daysOverdue,
                department: dept?.name || 'Unknown',
                assignee: {
                    name: assignee?.name || 'Unassigned',
                    avatar: assignee?.avatar
                }
            }
        })

    // 6. Top Departments (All Time or Period? Usually Period Performance)
    // We will use Period Completed tasks for ranking
    const deptStats = departments.map(d => {
        const deptTasks = tasks.filter(t => t.department_id === d.id && t.status === 'done' && new Date(t.updated_at) >= startDate && new Date(t.updated_at) <= endDate)
        const totalDeptTasks = tasks.filter(t => t.department_id === d.id && new Date(t.created_at) >= startDate && new Date(t.created_at) <= endDate)

        // Simple score: % completed
        const score = totalDeptTasks.length > 0 ? Math.round((deptTasks.length / totalDeptTasks.length) * 100) : 0

        return {
            name: d.name,
            completed: deptTasks.length,
            score
        }
    }).sort((a, b) => b.completed - a.completed).slice(0, 5)

    // 7. Top Employees (Period Performance)
    const empStats = members.map(m => {
        const empTasks = tasks.filter(t => t.assignee_id === m.id && t.status === 'done' && new Date(t.updated_at) >= startDate && new Date(t.updated_at) <= endDate)
        const dept = departments.find(d => d.id === m.department_id)

        return {
            id: m.id,
            name: m.name,
            department: dept?.name || '',
            tasks: empTasks.length,
            avatar: m.avatar
        }
    }).filter(e => e.tasks > 0).sort((a, b) => b.tasks - a.tasks).slice(0, 5)

    // 8. Pie Chart Data - Status Distribution (Period-based)
    const statusColors = {
        completed: '#10b981',
        inProgress: '#eab308',
        overdue: '#ef4444'
    }

    const pieChartData = {
        labels: ['Hoàn thành', 'Đang làm', 'Quá hạn'],
        datasets: [{
            data: [completed, inProgress, overdue],
            backgroundColor: [
                statusColors.completed,
                statusColors.inProgress,
                statusColors.overdue
            ]
        }]
    }

    // 9. Doughnut Chart Data - Department Distribution (Period-based)
    // Generate colors for departments
    const generateColor = (index: number) => {
        const hues = [210, 270, 30, 180, 330, 150, 60, 240]
        const hue = hues[index % hues.length]
        return `hsl(${hue}, 70%, 55%)`
    }

    const deptTaskCounts = departments.map((d, index) => {
        const count = tasks.filter(t => t.department_id === d.id && new Date(t.created_at) >= startDate && new Date(t.created_at) <= endDate).length
        return {
            name: d.name,
            count,
            color: generateColor(index)
        }
    }).filter(d => d.count > 0)

    const doughnutChartData = {
        labels: deptTaskCounts.map(d => d.name),
        datasets: [{
            data: deptTaskCounts.map(d => d.count),
            backgroundColor: deptTaskCounts.map(d => d.color)
        }]
    }

    // 10. Line Chart Data - Completion Trend (Last 7 Days)
    const last7DaysLabels: string[] = []
    const last7DaysCompletedData: number[] = []

    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const label = format(d, 'dd/MM')
        last7DaysLabels.push(label)

        const dayCompleted = tasks.filter(t => t.status === 'done' && isSameDay(new Date(t.updated_at), d)).length
        last7DaysCompletedData.push(dayCompleted)
    }

    const lineChartData = {
        labels: last7DaysLabels,
        datasets: [{
            label: 'Hoàn thành',
            data: last7DaysCompletedData,
            borderColor: '#10b981',
            backgroundColor: '#10b981'
        }]
    }

    // 11. Horizontal Bar Chart - Top 5 Assignees (Period-based)
    const assigneeStats = members.map(m => {
        const assigneeTasks = tasks.filter(t => t.assignee_id === m.id && t.status === 'done' && new Date(t.updated_at) >= startDate && new Date(t.updated_at) <= endDate)
        return {
            name: m.name,
            count: assigneeTasks.length
        }
    }).filter(a => a.count > 0).sort((a, b) => b.count - a.count).slice(0, 5)

    const horizontalBarChartData = {
        labels: assigneeStats.map(a => a.name),
        datasets: [{
            label: 'Hoàn thành',
            data: assigneeStats.map(a => a.count),
            backgroundColor: '#3b82f6'
        }]
    }

    return {
        periodStats: {
            total,
            inProgress,
            completed,
            overdue
        },
        chartData: {
            labels,
            datasets: [
                {
                    label: 'Hoàn thành',
                    backgroundColor: '#10b981',
                    data: completedData
                },
                {
                    label: 'Đang làm',
                    backgroundColor: '#eab308',
                    data: inProgressData
                },
                {
                    label: 'Quá hạn',
                    backgroundColor: '#ef4444',
                    data: overdueData
                }
            ]
        },
        pieChartData,
        doughnutChartData,
        lineChartData,
        horizontalBarChartData,
        overdueTasks: allOverdue,
        topDepartments: deptStats,
        topEmployees: empStats
    }
})
