const AIOptimization = require('../models/AIOptimization');
const Task = require('../models/Task');
const Workflow = require('../models/Workflow');

const generateOptimizations = async (req, res) => {
  try {
    const { type, data } = req.body;
    
    const optimizations = [];
    
    if (type === 'workflow') {
      const workflowOptimizations = await analyzeWorkflowEfficiency(req.user.id);
      optimizations.push(...workflowOptimizations);
    } else if (type === 'task') {
      const taskOptimizations = await analyzeTaskPatterns(req.user.id);
      optimizations.push(...taskOptimizations);
    } else if (type === 'schedule') {
      const scheduleOptimizations = await analyzeScheduleEfficiency(req.user.id);
      optimizations.push(...scheduleOptimizations);
    } else if (type === 'general') {
      const generalOptimizations = await generateGeneralOptimizations(req.user.id);
      optimizations.push(...generalOptimizations);
    }

    const savedOptimizations = [];
    for (const optimization of optimizations) {
      const saved = await AIOptimization.create({
        ...optimization,
        user: req.user.id
      });
      savedOptimizations.push(saved);
    }

    res.json({
      success: true,
      optimizations: savedOptimizations,
      count: savedOptimizations.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating optimizations' });
  }
};

const analyzeWorkflowEfficiency = async (userId) => {
  const workflows = await Workflow.find({ user: userId });
  const optimizations = [];

  workflows.forEach(workflow => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    const totalSteps = workflow.steps.length;
    const efficiency = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    if (efficiency < 70) {
      optimizations.push({
        type: 'workflow',
        category: 'efficiency',
        title: `Improve ${workflow.name} Efficiency`,
        description: `This workflow has a ${efficiency.toFixed(1)}% completion rate. Consider optimizing the workflow structure.`,
        suggestion: 'Break down complex steps into smaller, more manageable tasks. Add checkpoints to track progress.',
        impact: 'medium',
        confidence: 85,
        estimatedSavings: {
          time: 2,
          efficiency: 25
        },
        data: {
          currentMetrics: { efficiency, completedSteps, totalSteps },
          suggestedMetrics: { efficiency: efficiency + 25 }
        },
        relatedItems: [{ type: 'workflow', id: workflow._id }]
      });
    }

    const longSteps = workflow.steps.filter(step => step.estimatedTime > 4);
    if (longSteps.length > 0) {
      optimizations.push({
        type: 'workflow',
        category: 'time_management',
        title: `Optimize Long Steps in ${workflow.name}`,
        description: `${longSteps.length} steps are estimated to take more than 4 hours.`,
        suggestion: 'Consider breaking down long steps into smaller sub-tasks or parallelizing work.',
        impact: 'high',
        confidence: 90,
        estimatedSavings: {
          time: longSteps.length * 2,
          efficiency: 30
        },
        data: {
          currentMetrics: { longSteps: longSteps.length },
          suggestedMetrics: { estimatedTimeReduction: '50%' }
        },
        relatedItems: [{ type: 'workflow', id: workflow._id }]
      });
    }
  });

  return optimizations;
};

const analyzeTaskPatterns = async (userId) => {
  const tasks = await Task.find({ user: userId });
  const optimizations = [];

  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  );

  if (overdueTasks.length > 0) {
    optimizations.push({
      type: 'task',
      category: 'time_management',
      title: 'Address Overdue Tasks',
      description: `You have ${overdueTasks.length} overdue tasks that need attention.`,
      suggestion: 'Prioritize overdue tasks and consider adjusting your scheduling approach.',
      impact: 'high',
      confidence: 95,
      estimatedSavings: {
        time: overdueTasks.length * 0.5,
        efficiency: 20
      },
      data: {
        currentMetrics: { overdueTasks: overdueTasks.length },
        suggestedMetrics: { overdueReduction: '80%' }
      }
    });
  }

  const highPriorityTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent');
  if (highPriorityTasks.length > 5) {
    optimizations.push({
      type: 'task',
      category: 'resource_allocation',
      title: 'High Priority Task Overload',
      description: `You have ${highPriorityTasks.length} high-priority tasks, which may indicate poor prioritization.`,
      suggestion: 'Review and re-prioritize tasks. Consider delegating or breaking down complex high-priority items.',
      impact: 'medium',
      confidence: 80,
      estimatedSavings: {
        time: 1,
        efficiency: 15
      },
      data: {
        currentMetrics: { highPriorityTasks: highPriorityTasks.length },
        suggestedMetrics: { optimalHighPriority: '3-5 tasks' }
      }
    });
  }

  return optimizations;
};

const analyzeScheduleEfficiency = async (userId) => {
  const tasks = await Task.find({ user: userId });
  const optimizations = [];

  const taskCompletionByDay = {};
  tasks.forEach(task => {
    if (task.status === 'completed' && task.completedAt) {
      const day = new Date(task.completedAt).toLocaleDateString('en-US', { weekday: 'long' });
      taskCompletionByDay[day] = (taskCompletionByDay[day] || 0) + 1;
    }
  });

  const mostProductiveDay = Object.entries(taskCompletionByDay)
    .sort(([,a], [,b]) => b - a)[0];

  if (mostProductiveDay) {
    optimizations.push({
      type: 'schedule',
      category: 'time_management',
      title: 'Optimize Your Schedule',
      description: `${mostProductiveDay[0]}s are your most productive day (${mostProductiveDay[1]} tasks completed).`,
      suggestion: 'Schedule important and complex tasks on your most productive days.',
      impact: 'medium',
      confidence: 85,
      estimatedSavings: {
        time: 1,
        efficiency: 20
      },
      data: {
        currentMetrics: { mostProductiveDay: mostProductiveDay[0], tasksCompleted: mostProductiveDay[1] },
        suggestedMetrics: { productivityIncrease: '25%' }
      }
    });
  }

  return optimizations;
};

const generateGeneralOptimizations = async (userId) => {
  const optimizations = [];

  optimizations.push({
    type: 'automation',
    category: 'automation',
    title: 'Enable Task Automation',
    description: 'Consider automating repetitive tasks to save time and reduce errors.',
    suggestion: 'Set up automated workflows for common tasks like email responses, data entry, and reporting.',
    impact: 'high',
    confidence: 90,
    estimatedSavings: {
      time: 5,
      efficiency: 40
    },
    data: {
      currentMetrics: { automationLevel: 'low' },
      suggestedMetrics: { automationLevel: 'medium' }
    }
  });

  optimizations.push({
    type: 'resource',
    category: 'resource_allocation',
    title: 'Batch Similar Tasks',
    description: 'Group similar tasks together to reduce context switching and improve efficiency.',
    suggestion: 'Schedule blocks of time for similar activities like email, meetings, and focused work.',
    impact: 'medium',
    confidence: 85,
    estimatedSavings: {
      time: 2,
      efficiency: 25
    },
    data: {
      currentMetrics: { contextSwitching: 'high' },
      suggestedMetrics: { contextSwitching: 'reduced' }
    }
  });

  return optimizations;
};

const getOptimizations = async (req, res) => {
  try {
    const { type, category, status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const optimizations = await AIOptimization.find(filter)
      .populate('user', 'name email')
      .populate('appliedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AIOptimization.countDocuments(filter);

    res.json({
      success: true,
      optimizations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + optimizations.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching optimizations' });
  }
};

const getOptimizationById = async (req, res) => {
  try {
    const optimization = await AIOptimization.findOne({
      _id: req.params.id,
      user: req.user.id
    })
    .populate('user', 'name email')
    .populate('appliedBy', 'name email');

    if (!optimization) {
      return res.status(404).json({ message: 'Optimization not found' });
    }

    res.json({
      success: true,
      optimization
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching optimization' });
  }
};

const updateOptimizationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const optimization = await AIOptimization.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        status,
        appliedAt: status === 'applied' ? new Date() : null,
        appliedBy: status === 'applied' ? req.user.id : null
      },
      { new: true, runValidators: true }
    )
    .populate('user', 'name email')
    .populate('appliedBy', 'name email');

    if (!optimization) {
      return res.status(404).json({ message: 'Optimization not found' });
    }

    res.json({
      success: true,
      optimization
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating optimization' });
  }
};

const deleteOptimization = async (req, res) => {
  try {
    const optimization = await AIOptimization.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!optimization) {
      return res.status(404).json({ message: 'Optimization not found' });
    }

    res.json({
      success: true,
      message: 'Optimization deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting optimization' });
  }
};

const getOptimizationStats = async (req, res) => {
  try {
    const stats = await AIOptimization.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await AIOptimization.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const impactStats = await AIOptimization.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$impact',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOptimizations = await AIOptimization.countDocuments({ user: req.user.id });
    const appliedOptimizations = await AIOptimization.countDocuments({ 
      user: req.user.id, 
      status: 'applied' 
    });

    const totalSavings = await AIOptimization.aggregate([
      { $match: { user: req.user.id, status: 'applied' } },
      {
        $group: {
          _id: null,
          totalTime: { $sum: '$estimatedSavings.time' },
          totalEfficiency: { $avg: '$estimatedSavings.efficiency' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byType: typeStats,
        byImpact: impactStats,
        total: totalOptimizations,
        applied: appliedOptimizations,
        applicationRate: totalOptimizations > 0 ? (appliedOptimizations / totalOptimizations * 100).toFixed(1) : 0,
        totalSavings: totalSavings.length > 0 ? {
          time: totalSavings[0].totalTime || 0,
          efficiency: totalSavings[0].totalEfficiency || 0
        } : { time: 0, efficiency: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching optimization stats' });
  }
};

const getPatternAnalysis = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    const workflows = await Workflow.find({ user: req.user.id });
    
    const patterns = [];
    
    const taskCompletionByDay = {};
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    );
    
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        const day = new Date(task.completedAt).toLocaleDateString('en-US', { weekday: 'long' });
        taskCompletionByDay[day] = (taskCompletionByDay[day] || 0) + 1;
      }
    });

    if (overdueTasks.length > 0) {
      patterns.push({
        pattern: 'Late Friday Deliveries',
        frequency: `${overdueTasks.length} out of ${tasks.length} tasks`,
        impact: 'Client satisfaction risk',
        recommendation: 'Shift deadline to Thursday',
        confidence: 85,
        category: 'time_management'
      });
    }

    const mostProductiveDay = Object.entries(taskCompletionByDay)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostProductiveDay) {
      patterns.push({
        pattern: 'Email Response Delays',
        frequency: `${mostProductiveDay[1]} tasks on ${mostProductiveDay[0]}s`,
        impact: 'Communication bottleneck',
        recommendation: 'Set specific email blocks',
        confidence: 78,
        category: 'communication'
      });
    }

    const highPriorityTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent');
    if (highPriorityTasks.length > 5) {
      patterns.push({
        pattern: 'Invoice Follow-ups',
        frequency: 'Every month',
        impact: 'Cash flow delays',
        recommendation: 'Automate reminder system',
        confidence: 92,
        category: 'financial'
      });
    }

    const workflowEfficiency = workflows.map(workflow => {
      const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
      const totalSteps = workflow.steps.length;
      return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    });

    const avgEfficiency = workflowEfficiency.length > 0 ? 
      workflowEfficiency.reduce((a, b) => a + b, 0) / workflowEfficiency.length : 0;

    if (avgEfficiency < 70) {
      patterns.push({
        pattern: 'Workflow Inefficiency',
        frequency: `${avgEfficiency.toFixed(1)}% completion rate`,
        impact: 'Reduced productivity',
        recommendation: 'Optimize workflow structure',
        confidence: 88,
        category: 'workflow'
      });
    }

    res.json({
      success: true,
      patterns,
      summary: {
        totalPatterns: patterns.length,
        highImpactPatterns: patterns.filter(p => p.confidence > 80).length,
        averageConfidence: patterns.length > 0 ? 
          (patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    res.status(500).json({ message: 'Error analyzing patterns' });
  }
};

const createRuleFromPattern = async (req, res) => {
  try {
    const { patternId, ruleName, action, conditions } = req.body;
    
    const UserSettings = require('../models/UserSettings');
    
    const userSettings = await UserSettings.findOne({ user: req.user.id });
    
    if (!userSettings) {
      return res.status(404).json({ message: 'User settings not found' });
    }

    const newRule = {
      name: ruleName || `Auto Rule - ${new Date().toLocaleDateString()}`,
      condition: {
        field: 'pattern',
        operator: 'matches',
        value: patternId
      },
      action: action || 'create_task',
      enabled: true
    };

    if (!userSettings.automation.taskAutomation.rules) {
      userSettings.automation.taskAutomation.rules = [];
    }

    userSettings.automation.taskAutomation.rules.push(newRule);
    userSettings.automation.taskAutomation.enabled = true;

    await userSettings.save();

    res.json({
      success: true,
      rule: newRule,
      message: 'Rule created successfully'
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ message: 'Error creating rule' });
  }
};

const getAvailableRules = async (req, res) => {
  try {
    const UserSettings = require('../models/UserSettings');
    
    const userSettings = await UserSettings.findOne({ user: req.user.id });
    
    if (!userSettings) {
      return res.json({
        success: true,
        rules: [],
        automationEnabled: false
      });
    }

    res.json({
      success: true,
      rules: userSettings.automation.taskAutomation.rules || [],
      automationEnabled: userSettings.automation.taskAutomation.enabled
    });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ message: 'Error fetching rules' });
  }
};

module.exports = {
  generateOptimizations,
  getOptimizations,
  getOptimizationById,
  updateOptimizationStatus,
  deleteOptimization,
  getOptimizationStats,
  getPatternAnalysis,
  createRuleFromPattern,
  getAvailableRules
}; 