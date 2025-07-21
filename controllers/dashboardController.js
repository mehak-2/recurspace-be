const Task = require('../models/Task');
const Workflow = require('../models/Workflow');
const Template = require('../models/Template');
const AIOptimization = require('../models/AIOptimization');
const Analytics = require('../models/Analytics');

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      tasks,
      workflows,
      templates,
      optimizations,
      weeklyAnalytics,
      monthlyAnalytics
    ] = await Promise.all([
      Task.find({ user: userId }),
      Workflow.find({ user: userId }),
      Template.find({ user: userId }),
      AIOptimization.find({ user: userId }),
      Analytics.find({ 
        user: userId, 
        date: { $gte: weekAgo },
        period: 'daily'
      }),
      Analytics.find({ 
        user: userId, 
        date: { $gte: monthAgo },
        period: 'daily'
      })
    ]);

    const completedTasks = tasks.filter(task => task.status === 'completed');
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    );

    const activeWorkflows = workflows.filter(w => w.status === 'active');
    const completedWorkflows = workflows.filter(w => w.status === 'completed');

    const activeTemplates = templates.filter(t => t.status === 'active');
    const totalTemplateUsage = templates.reduce((sum, t) => sum + t.usage.totalUses, 0);

    const appliedOptimizations = optimizations.filter(o => o.status === 'applied');
    const totalTimeSaved = appliedOptimizations.reduce((sum, o) => sum + (o.estimatedSavings.time || 0), 0);

    const timeSavedThisWeek = weeklyAnalytics
      .filter(a => a.metric === 'time_saved')
      .reduce((sum, a) => sum + (a.value || 0), 0);

    const efficiencyScore = calculateEfficiencyScore(tasks, workflows, templates);

    const aiInsights = await generateAIInsights(userId, tasks, workflows);

    const quickStats = {
      timeSaved: {
        thisWeek: timeSavedThisWeek,
        thisMonth: totalTimeSaved,
        trend: calculateTrend(weeklyAnalytics, 'time_saved')
      },
      tasks: {
        completed: completedTasks.length,
        pending: pendingTasks.length,
        inProgress: inProgressTasks.length,
        overdue: overdueTasks.length,
        total: tasks.length
      },
      workflows: {
        active: activeWorkflows.length,
        completed: completedWorkflows.length,
        total: workflows.length
      },
      templates: {
        active: activeTemplates.length,
        totalUsage: totalTemplateUsage,
        total: templates.length
      },
      efficiency: {
        score: efficiencyScore,
        trend: calculateTrend(monthlyAnalytics, 'efficiency_score')
      },
      revenue: {
        thisMonth: calculateRevenue(monthlyAnalytics),
        trend: calculateTrend(monthlyAnalytics, 'revenue')
      }
    };

    res.json({
      success: true,
      dashboard: {
        quickStats,
        aiInsights,
        recentActivity: await getRecentActivity(userId),
        upcomingDeadlines: await getUpcomingDeadlines(userId)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

const calculateEfficiencyScore = (tasks, workflows, templates) => {
  const taskCompletionRate = tasks.length > 0 ? 
    tasks.filter(t => t.status === 'completed').length / tasks.length : 0;
  
  const workflowCompletionRate = workflows.length > 0 ? 
    workflows.filter(w => w.status === 'completed').length / workflows.length : 0;
  
  const templateUsageRate = templates.length > 0 ? 
    templates.filter(t => t.usage.totalUses > 0).length / templates.length : 0;

  const efficiency = (taskCompletionRate * 0.4 + workflowCompletionRate * 0.4 + templateUsageRate * 0.2) * 100;
  return Math.round(efficiency);
};

const calculateTrend = (analytics, metric) => {
  const metricData = analytics.filter(a => a.metric === metric);
  if (metricData.length < 2) return 0;

  const recent = metricData.slice(-1)[0]?.value || 0;
  const previous = metricData.slice(-2)[0]?.value || 0;
  
  if (previous === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - previous) / previous) * 100);
};

const calculateRevenue = (analytics) => {
  const revenueData = analytics.filter(a => a.metric === 'revenue');
  return revenueData.reduce((sum, a) => sum + (a.value || 0), 0);
};

const generateAIInsights = async (userId, tasks, workflows) => {
  const insights = [];

  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  );

  if (overdueTasks.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Address Overdue Tasks',
      description: `You have ${overdueTasks.length} overdue tasks that need attention.`,
      action: 'view_tasks',
      priority: 'high'
    });
  }

  const lowEfficiencyWorkflows = workflows.filter(w => w.progress < 50 && w.status === 'active');
  if (lowEfficiencyWorkflows.length > 0) {
    insights.push({
      type: 'info',
      title: 'Optimize Workflow Progress',
      description: `${lowEfficiencyWorkflows.length} workflows are below 50% completion.`,
      action: 'view_workflows',
      priority: 'medium'
    });
  }

  const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
  if (highPriorityTasks.length > 5) {
    insights.push({
      type: 'suggestion',
      title: 'High Priority Task Management',
      description: 'You have many high-priority tasks. Consider delegating or breaking them down.',
      action: 'optimize_tasks',
      priority: 'medium'
    });
  }

  return insights;
};

const getRecentActivity = async (userId) => {
  const recentTasks = await Task.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('title status updatedAt');

  const recentWorkflows = await Workflow.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('name status updatedAt');

  const activities = [
    ...recentTasks.map(task => ({
      type: 'task',
      title: task.title,
      status: task.status,
      timestamp: task.updatedAt
    })),
    ...recentWorkflows.map(workflow => ({
      type: 'workflow',
      title: workflow.name,
      status: workflow.status,
      timestamp: workflow.updatedAt
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
   .slice(0, 10);

  return activities;
};

const getUpcomingDeadlines = async (userId) => {
  const upcomingTasks = await Task.find({
    user: userId,
    dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    status: { $ne: 'completed' }
  })
  .sort({ dueDate: 1 })
  .limit(5)
  .select('title dueDate priority');

  return upcomingTasks.map(task => ({
    title: task.title,
    dueDate: task.dueDate,
    priority: task.priority,
    daysLeft: Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
  }));
};

module.exports = {
  getDashboardOverview
}; 