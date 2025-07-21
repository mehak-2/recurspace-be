const Workflow = require('../models/Workflow');

const createWorkflow = async (req, res) => {
  try {
    const workflowData = {
      ...req.body,
      user: req.user.id
    };
    

    const workflow = await Workflow.create(workflowData);
    await workflow.populate('user', 'name email');

    res.status(201).json({
      success: true,
      workflow
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating workflow' });
  }
};

const getWorkflows = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const workflows = await Workflow.find(filter)
      .populate('user', 'name email')
      .populate('collaborators.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Workflow.countDocuments(filter);

    res.json({
      success: true,
      workflows,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + workflows.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflows' });
  }
};

const getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      user: req.user.id
    })
    .populate('user', 'name email')
    .populate('collaborators.user', 'name email')
    .populate('steps.assignedTo', 'name email');

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflow' });
  }
};

const updateWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('user', 'name email')
    .populate('collaborators.user', 'name email');

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error updating workflow' });
  }
};

const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workflow' });
  }
};

const updateWorkflowStep = async (req, res) => {
  try {
    const { stepIndex, status, notes, actualTime } = req.body;
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    if (stepIndex >= 0 && stepIndex < workflow.steps.length) {
      workflow.steps[stepIndex].status = status;
      if (notes) workflow.steps[stepIndex].notes = notes;
      if (actualTime) workflow.steps[stepIndex].actualTime = actualTime;
      
      if (status === 'completed') {
        workflow.steps[stepIndex].completedAt = new Date();
      }

      await workflow.save();
      await workflow.populate('user', 'name email');
      await workflow.populate('collaborators.user', 'name email');

      res.json({
        success: true,
        workflow
      });
    } else {
      res.status(400).json({ message: 'Invalid step index' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating workflow step' });
  }
};

const getWorkflowStats = async (req, res) => {
  try {
    const stats = await Workflow.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Workflow.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalWorkflows = await Workflow.countDocuments({ user: req.user.id });
    const completedWorkflows = await Workflow.countDocuments({ 
      user: req.user.id, 
      status: 'completed' 
    });

    const averageProgress = await Workflow.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byPriority: priorityStats,
        total: totalWorkflows,
        completed: completedWorkflows,
        completionRate: totalWorkflows > 0 ? (completedWorkflows / totalWorkflows * 100).toFixed(1) : 0,
        averageProgress: averageProgress.length > 0 ? averageProgress[0].averageProgress.toFixed(1) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflow stats' });
  }
};

const duplicateWorkflow = async (req, res) => {
  try {
    const originalWorkflow = await Workflow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!originalWorkflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    const workflowData = {
      name: `${originalWorkflow.name} (Copy)`,
      description: originalWorkflow.description,
      type: originalWorkflow.type,
      steps: originalWorkflow.steps.map(step => ({
        ...step.toObject(),
        status: 'pending',
        completedAt: null,
        actualTime: null
      })),
      priority: originalWorkflow.priority,
      tags: originalWorkflow.tags,
      automation: originalWorkflow.automation,
      user: req.user.id
    };

    const newWorkflow = await Workflow.create(workflowData);
    await newWorkflow.populate('user', 'name email');

    res.status(201).json({
      success: true,
      workflow: newWorkflow
    });
  } catch (error) {
    res.status(500).json({ message: 'Error duplicating workflow' });
  }
};

const getWorkflowTrackerStats = async (req, res) => {
  try {
    const activeWorkflows = await Workflow.countDocuments({ user: req.user.id, status: 'active' });

    const totalTimeSaved = await Workflow.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: null,
          totalTime: {
            $sum: {
              $toDouble: {
                $replaceAll: {
                  input: "$timeSaved",
                  find: "h",
                  replacement: ""
                }
              }
            }
          }
        }
      }
    ]);

    const avgCompletion = await Workflow.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: "$completionRate" }
        }
      }
    ]);

    const opportunities = await Workflow.countDocuments({
      user: req.user.id,
      status: "needs_attention"
    });

    res.json({
      success: true,
      stats: {
        activeWorkflows,
        totalTimeSaved: totalTimeSaved[0]?.totalTime || 0,
        avgCompletion: avgCompletion[0]?.avgCompletion?.toFixed(1) || 0,
        opportunities
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching workflow tracker stats" });
  }
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  updateWorkflowStep,
  getWorkflowStats,
  duplicateWorkflow,
  getWorkflowTrackerStats
}; 