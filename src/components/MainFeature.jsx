import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from './ApperIcon'
import { TaskService } from '../services'

const MainFeature = ({
  tasks,
  lists,
  selectedList,
  showArchived,
  searchQuery,
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate,
  getListName,
  getListColor
}) => {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    listId: selectedList === 'all' ? (lists?.[0]?.id || '') : selectedList,
    priority: 'medium',
    dueDate: ''
  })

  useEffect(() => {
    if (selectedList !== 'all') {
      setFormData(prev => ({ ...prev, listId: selectedList }))
    }
  }, [selectedList])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    try {
      if (editingTask) {
        const updatedTask = await TaskService.update(editingTask.id, formData)
        onTaskUpdate(updatedTask)
        toast.success('Task updated successfully')
      } else {
        const newTask = await TaskService.create({
          ...formData,
          completed: false,
          archived: false
        })
        onTaskCreate(newTask)
        toast.success('Task created successfully')
      }
      
      resetForm()
    } catch (error) {
      toast.error('Failed to save task')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      listId: selectedList === 'all' ? (lists?.[0]?.id || '') : selectedList,
      priority: 'medium',
      dueDate: ''
    })
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await TaskService.update(task.id, {
        ...task,
        completed: !task.completed
      })
      onTaskUpdate(updatedTask)
      toast.success(updatedTask.completed ? 'Task completed!' : 'Task marked incomplete')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleArchiveTask = async (task) => {
    try {
      const updatedTask = await TaskService.update(task.id, {
        ...task,
        archived: !task.archived
      })
      onTaskUpdate(updatedTask)
      toast.success(updatedTask.archived ? 'Task archived' : 'Task restored')
    } catch (error) {
      toast.error('Failed to archive task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    
    try {
      await TaskService.delete(taskId)
      onTaskDelete(taskId)
      toast.success('Task deleted successfully')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title || '',
      description: task.description || '',
      listId: task.listId || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
    })
    setShowTaskForm(true)
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetTask) => {
    e.preventDefault()
    if (draggedTask && targetTask && draggedTask.id !== targetTask.id) {
      // Simple reorder logic - you can implement more complex reordering here
      toast.info('Drag and drop reordering')
    }
    setDraggedTask(null)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-surface-900 dark:text-surface-100">
            {showArchived ? 'Archived Tasks' : selectedList === 'all' ? 'All Tasks' : getListName(selectedList)}
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            {tasks?.length || 0} task{tasks?.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {!showArchived && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTaskForm(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={18} />
            Add Task
          </motion.button>
        )}
      </div>

      {/* Task Form */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-6 shadow-card"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded"
                >
                  <ApperIcon name="X" size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-700"
                    placeholder="Enter task title..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-700"
                    placeholder="Enter task description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    List
                  </label>
                  <select
                    value={formData.listId}
                    onChange={(e) => setFormData(prev => ({ ...prev, listId: e.target.value }))}
                    className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-700"
                  >
                    {lists?.map(list => (
                      <option key={list?.id} value={list?.id}>
                        {list?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-700"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-surface-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {tasks?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center">
                <ApperIcon name="CheckSquare" size={32} className="text-surface-400" />
              </div>
              <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
                {showArchived ? 'No archived tasks' : 'No tasks yet'}
              </h3>
              <p className="text-surface-600 dark:text-surface-400">
                {showArchived 
                  ? 'Archived tasks will appear here' 
                  : 'Create your first task to get started'}
              </p>
            </motion.div>
          ) : (
            tasks?.map((task) => (
              <motion.div
                key={task?.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, task)}
                className={`bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 shadow-soft hover:shadow-card transition-all duration-200 cursor-move ${
                  task?.completed ? 'opacity-75' : ''
                } ${draggedTask?.id === task?.id ? 'scale-105 shadow-lg' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      task?.completed
                        ? 'bg-primary border-primary text-white'
                        : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                    }`}
                  >
                    {task?.completed && <ApperIcon name="Check" size={12} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className={`font-medium text-surface-900 dark:text-surface-100 ${
                          task?.completed ? 'line-through' : ''
                        }`}>
                          {task?.title}
                        </h3>
                        {task?.description && (
                          <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                            {task?.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded transition-colors"
                        >
                          <ApperIcon name="Edit" size={14} />
                        </button>
                        <button
                          onClick={() => handleArchiveTask(task)}
                          className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded transition-colors"
                        >
                          <ApperIcon name={task?.archived ? "RotateCcw" : "Archive"} size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task?.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded transition-colors"
                        >
                          <ApperIcon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getListColor(task?.listId) }}
                        />
                        {getListName(task?.listId)}
                      </div>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task?.priority)}`}>
                        {task?.priority}
                      </span>

                      {task?.dueDate && (
                        <span className="px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 rounded-full text-xs">
                          {format(new Date(task?.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MainFeature