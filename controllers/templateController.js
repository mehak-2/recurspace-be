const Template = require('../models/Template');
const Task = require('../models/Task');
const Workflow = require('../models/Workflow');
const AIOptimization = require('../models/AIOptimization');
const Analytics = require('../models/Analytics');

const createTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      user: req.user.id,
      usage: {
        totalUses: 0,
        lastUsed: null,
        successRate: 100,
        averageTime: req.body.metadata?.estimatedTime || 15
      }
    };

    const template = await Template.create(templateData);
    await template.populate('user', 'name email');

    res.status(201).json({
      success: true,
      template
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating template' });
  }
};

const getTemplates = async (req, res) => {
  try {
    const { type, category, status, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const templates = await Template.find(filter)
      .populate('user', 'name email')
      .populate('collaborators.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Template.countDocuments(filter);

    res.json({
      success: true,
      templates,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + templates.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates' });
  }
};

const getPublicTemplates = async (req, res) => {
  try {
    const { type, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { 
      'permissions.isPublic': true,
      status: 'active'
    };

    if (type) filter.type = type;
    if (category) filter.category = category;

    const templates = await Template.find(filter)
      .populate('user', 'name email')
      .sort({ 'usage.totalUses': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Template.countDocuments(filter);

    res.json({
      success: true,
      templates,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + templates.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public templates' });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'permissions.isPublic': true }
      ]
    })
    .populate('user', 'name email')
    .populate('collaborators.user', 'name email')
    .populate('parentTemplate', 'name description');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching template' });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('user', 'name email')
    .populate('collaborators.user', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error updating template' });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting template' });
  }
};

const executeTemplate = async (req, res) => {
  try {
    const { variables, targetType } = req.body;
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'permissions.isPublic': true }
      ]
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    let processedContent = template.content;
    
    if (variables && template.variables) {
      template.variables.forEach(variable => {
        const value = variables[variable.name] || variable.defaultValue || '';
        const regex = new RegExp(`{{${variable.name}}}`, 'g');
        processedContent = processedContent.replace(regex, value);
      });
    }

    const result = {
      content: processedContent,
      variables: variables || {},
      template: {
        id: template._id,
        name: template.name,
        type: template.type
      }
    };

    await Template.findByIdAndUpdate(template._id, {
      $inc: { 'usage.totalUses': 1 },
      $set: { 'usage.lastUsed': new Date() }
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({ message: 'Error executing template' });
  }
};

const duplicateTemplate = async (req, res) => {
  try {
    const originalTemplate = await Template.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'permissions.isPublic': true, 'permissions.allowDuplication': true }
      ]
    });

    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found or cannot be duplicated' });
    }

    const templateData = {
      name: `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      type: originalTemplate.type,
      category: originalTemplate.category,
      content: originalTemplate.content,
      variables: originalTemplate.variables,
      metadata: {
        ...originalTemplate.metadata,
        version: '1.0'
      },
      automation: originalTemplate.automation,
      permissions: {
        ...originalTemplate.permissions,
        isPublic: false
      },
      status: 'draft',
      user: req.user.id,
      parentTemplate: originalTemplate._id,
      usage: {
        totalUses: 0,
        lastUsed: null,
        successRate: 100,
        averageTime: originalTemplate.metadata?.estimatedTime || 15
      }
    };

    const newTemplate = await Template.create(templateData);
    await newTemplate.populate('user', 'name email');

    res.status(201).json({
      success: true,
      template: newTemplate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error duplicating template' });
  }
};

const copyTemplate = async (req, res) => {
  try {
    const { targetType, variables } = req.body;
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        { 'permissions.isPublic': true }
      ]
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    let result;
    
    if (targetType === 'task') {
      result = await createTaskFromTemplate(template, variables, req.user.id);
    } else if (targetType === 'workflow') {
      result = await createWorkflowFromTemplate(template, variables, req.user.id);
    } else {
      result = {
        content: processTemplateContent(template.content, variables),
        type: 'content',
        template: {
          id: template._id,
          name: template.name
        }
      };
    }

    await Template.findByIdAndUpdate(template._id, {
      $inc: { 'usage.totalUses': 1 },
      $set: { 'usage.lastUsed': new Date() }
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({ message: 'Error copying template' });
  }
};

const createTaskFromTemplate = async (template, variables, userId) => {
  const taskData = {
    title: processTemplateContent(template.content, variables),
    description: template.description,
    status: 'pending',
    priority: 'medium',
    user: userId,
    tags: template.metadata?.tags || [],
    isRecurring: template.automation?.enabled || false
  };

  const task = await Task.create(taskData);
  return {
    type: 'task',
    id: task._id,
    title: task.title,
    template: {
      id: template._id,
      name: template.name
    }
  };
};

const createWorkflowFromTemplate = async (template, variables, userId) => {
  const workflowData = {
    name: processTemplateContent(template.content, variables),
    description: template.description,
    status: 'active',
    type: 'manual',
    steps: [],
    currentStep: 0,
    progress: 0,
    priority: 'medium',
    startDate: new Date(),
    tags: template.metadata?.tags || [],
    user: userId
  };

  const workflow = await Workflow.create(workflowData);
  return {
    type: 'workflow',
    id: workflow._id,
    name: workflow.name,
    template: {
      id: template._id,
      name: template.name
    }
  };
};

const processTemplateContent = (content, variables) => {
  let processedContent = content;
  
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value || '');
    });
  }
  
  return processedContent;
};

const getTemplateStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const templates = await Template.find({ user: userId });
    const monthlyTemplates = await Template.find({
      user: userId,
      createdAt: { $gte: monthAgo }
    });

    const totalTemplates = templates.length;
    const totalUsage = templates.reduce((sum, t) => sum + t.usage.totalUses, 0);
    
    const timeSaved = templates.reduce((sum, t) => {
      const avgTime = t.metadata?.estimatedTime || 15;
      return sum + (t.usage.totalUses * avgTime);
    }, 0);

    const mostUsedTemplate = templates.reduce((max, t) => 
      t.usage.totalUses > max.usage.totalUses ? t : max, 
      { usage: { totalUses: 0 }, name: 'None' }
    );

    const categoryBreakdown = {};
    templates.forEach(template => {
      categoryBreakdown[template.category] = (categoryBreakdown[template.category] || 0) + 1;
    });

    const usageTrend = await Analytics.find({
      user: userId,
      type: 'template',
      date: { $gte: monthAgo }
    }).sort({ date: 1 });

    res.json({
      success: true,
      stats: {
        totalTemplates,
        totalUsage,
        timeSaved: Math.round(timeSaved / 60), // Convert to hours
        mostUsed: mostUsedTemplate.name,
        categoryBreakdown,
        usageTrend: usageTrend.map(a => ({
          date: a.date,
          usage: a.value
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({ message: 'Error fetching template statistics' });
  }
};

const searchTemplates = async (req, res) => {
  try {
    const { query, category, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user.id;

    let filter = { user: userId };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(query, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const templates = await Template.find(filter)
      .sort(sortOptions)
      .populate('user', 'name email');

    res.json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({ message: 'Error searching templates' });
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getPublicTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  executeTemplate,
  duplicateTemplate,
  copyTemplate,
  getTemplateStats,
  searchTemplates
}; 