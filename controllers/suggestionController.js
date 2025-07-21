const analyzeTaskPatterns = (tasks) => {
  const analysis = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.completed).length,
    overdueTasks: tasks.filter(task => !task.completed && new Date(task.dueDate) < new Date()).length,
    frequencyBreakdown: {},
    completionRates: {},
    timeDistribution: {}
  };

  tasks.forEach(task => {
    analysis.frequencyBreakdown[task.frequency] = (analysis.frequencyBreakdown[task.frequency] || 0) + 1;
    
    if (!analysis.completionRates[task.frequency]) {
      analysis.completionRates[task.frequency] = { completed: 0, total: 0 };
    }
    analysis.completionRates[task.frequency].total++;
    if (task.completed) {
      analysis.completionRates[task.frequency].completed++;
    }
  });

  return analysis;
};

const generateTimeOptimizationTips = (analysis) => {
  const tips = [];
  
  if (analysis.overdueTasks > 0) {
    tips.push({
      type: 'time_optimization',
      title: 'Address Overdue Tasks',
      description: `You have ${analysis.overdueTasks} overdue tasks. Consider dedicating a specific time block to catch up on these items.`,
      priority: 'high'
    });
  }

  const lowCompletionRates = Object.entries(analysis.completionRates)
    .filter(([frequency, data]) => data.total > 0 && (data.completed / data.total) < 0.5);

  if (lowCompletionRates.length > 0) {
    tips.push({
      type: 'time_optimization',
      title: 'Improve Completion Rates',
      description: `Tasks with ${lowCompletionRates.map(([f]) => f).join(', ')} frequency have low completion rates. Consider adjusting your schedule or breaking them into smaller chunks.`,
      priority: 'medium'
    });
  }

  if (analysis.totalTasks > 10) {
    tips.push({
      type: 'time_optimization',
      title: 'Task Volume Management',
      description: 'You have a high number of recurring tasks. Consider consolidating similar tasks or reducing frequency for less critical items.',
      priority: 'medium'
    });
  }

  return tips;
};

const generateTaskBatchingAdvice = (tasks) => {
  const advice = [];
  
  const tasksByFrequency = {};
  tasks.forEach(task => {
    if (!tasksByFrequency[task.frequency]) {
      tasksByFrequency[task.frequency] = [];
    }
    tasksByFrequency[task.frequency].push(task);
  });

  Object.entries(tasksByFrequency).forEach(([frequency, frequencyTasks]) => {
    if (frequencyTasks.length >= 3) {
      advice.push({
        type: 'task_batching',
        title: `Batch ${frequency} Tasks`,
        description: `You have ${frequencyTasks.length} ${frequency} tasks. Consider grouping them together to reduce context switching and improve efficiency.`,
        suggestedBatch: frequencyTasks.slice(0, 3).map(t => t.title),
        priority: 'medium'
      });
    }
  });

  const similarTasks = tasks.filter(task => 
    task.title.toLowerCase().includes('email') || 
    task.title.toLowerCase().includes('review') ||
    task.title.toLowerCase().includes('check')
  );

  if (similarTasks.length >= 2) {
    advice.push({
      type: 'task_batching',
      title: 'Group Similar Tasks',
      description: `Found ${similarTasks.length} similar tasks. Batch them together for better workflow efficiency.`,
      suggestedBatch: similarTasks.map(t => t.title),
      priority: 'low'
    });
  }

  return advice;
};

const generateOverduePatterns = (tasks) => {
  const patterns = [];
  
  const overdueTasks = tasks.filter(task => !task.completed && new Date(task.dueDate) < new Date());
  const completedTasks = tasks.filter(task => task.completed);

  if (overdueTasks.length > 0) {
    const overdueByFrequency = {};
    overdueTasks.forEach(task => {
      overdueByFrequency[task.frequency] = (overdueByFrequency[task.frequency] || 0) + 1;
    });

    const mostOverdueFrequency = Object.entries(overdueByFrequency)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostOverdueFrequency) {
      patterns.push({
        type: 'overdue_patterns',
        title: 'Frequency-Specific Overdue Pattern',
        description: `Most overdue tasks are ${mostOverdueFrequency[0]} (${mostOverdueFrequency[1]} tasks). Consider adjusting your schedule for ${mostOverdueFrequency[0]} tasks or reducing their frequency.`,
        priority: 'high',
        pattern: `${mostOverdueFrequency[0]}_overdue`
      });
    }
  }

  const completionByDay = {};
  completedTasks.forEach(task => {
    const dayOfWeek = new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long' });
    completionByDay[dayOfWeek] = (completionByDay[dayOfWeek] || 0) + 1;
  });

  const bestDay = Object.entries(completionByDay)
    .sort(([,a], [,b]) => b - a)[0];

  if (bestDay) {
    patterns.push({
      type: 'overdue_patterns',
      title: 'Optimal Completion Day',
      description: `${bestDay[0]}s are your most productive day for completing tasks (${bestDay[1]} completed). Consider scheduling important tasks on this day.`,
      priority: 'medium',
      pattern: 'optimal_day'
    });
  }

  return patterns;
};

const getSuggestions = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ 
        message: 'Tasks array is required' 
      });
    }

    if (tasks.length === 0) {
      return res.status(400).json({ 
        message: 'At least one task is required for analysis' 
      });
    }

    const analysis = analyzeTaskPatterns(tasks);
    
    const timeOptimizationTips = generateTimeOptimizationTips(analysis);
    const taskBatchingAdvice = generateTaskBatchingAdvice(tasks);
    const overduePatterns = generateOverduePatterns(tasks);

    const suggestions = {
      summary: {
        totalTasks: analysis.totalTasks,
        completionRate: analysis.totalTasks > 0 ? 
          ((analysis.completedTasks / analysis.totalTasks) * 100).toFixed(1) : 0,
        overdueCount: analysis.overdueTasks,
        frequencyBreakdown: analysis.frequencyBreakdown
      },
      recommendations: [
        ...timeOptimizationTips,
        ...taskBatchingAdvice,
        ...overduePatterns
      ],
      insights: {
        mostProductiveDay: 'Monday',
        recommendedBatchSize: 3,
        suggestedTimeBlocks: {
          morning: ['daily', 'weekly'],
          afternoon: ['monthly'],
          evening: ['review', 'planning']
        }
      }
    };

    res.json({
      success: true,
      suggestions,
      analysis: {
        patterns: analysis,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ 
      message: 'Error generating suggestions' 
    });
  }
};

module.exports = {
  getSuggestions
}; 