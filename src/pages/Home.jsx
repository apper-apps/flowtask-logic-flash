import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'
import { TaskService } from '../services'
import { ListService } from '../services'

const Home = () => {
  const [tasks, setTasks] = useState([])
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [selectedList, setSelectedList] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [tasksResult, listsResult] = await Promise.all([
          TaskService.getAll(),
          ListService.getAll()
        ])
        setTasks(tasksResult || [])
        setLists(listsResult || [])
      } catch (err) {
        setError(err.message)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const filteredTasks = tasks?.filter(task => {
    if (showArchived && !task?.archived) return false
    if (!showArchived && task?.archived) return false
    if (selectedList !== 'all' && task?.listId !== selectedList) return false
    if (searchQuery && !task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task?.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  }) || []

  const completedCount = filteredTasks?.filter(task => task?.completed).length || 0
  const totalCount = filteredTasks?.length || 0
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getListName = (listId) => {
    const list = lists?.find(l => l?.id === listId)
    return list?.name || 'Unknown List'
  }

  const getListColor = (listId) => {
    const list = lists?.find(l => l?.id === listId)
    return list?.color || 'gray'
  }

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev?.map(task => 
      task?.id === updatedTask?.id ? updatedTask : task
    ) || [])
  }

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev?.filter(task => task?.id !== taskId) || [])
  }

  const handleTaskCreate = (newTask) => {
    setTasks(prev => [...(prev || []), newTask])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors lg:hidden"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <ApperIcon name="CheckSquare" size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-heading font-semibold text-surface-900 dark:text-surface-100">
                FlowTask
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <ApperIcon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <ApperIcon name={darkMode ? "Sun" : "Moon"} size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border-r border-surface-200 dark:border-surface-700 lg:translate-x-0"
            >
              <div className="flex flex-col h-full pt-4">
                {/* Progress Ring */}
                <div className="px-6 mb-6">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-surface-200 dark:text-surface-700"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionRate / 100)}`}
                            className="text-primary transition-all duration-300"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                            {completionRate}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-surface-600 dark:text-surface-400">Today's Progress</p>
                        <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                          {completedCount} of {totalCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="px-4 flex-1">
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedList('all')
                        setShowArchived(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        selectedList === 'all' && !showArchived
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      <ApperIcon name="List" size={18} />
                      <span>All Tasks</span>
                      <span className="ml-auto text-xs bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded-full">
                        {tasks?.filter(t => !t?.archived).length || 0}
                      </span>
                    </button>

                    {lists?.map(list => (
                      <button
                        key={list?.id}
                        onClick={() => {
                          setSelectedList(list?.id)
                          setShowArchived(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedList === list?.id && !showArchived
                            ? 'bg-primary text-white'
                            : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: list?.color }} />
                        <span>{list?.name}</span>
                        <span className="ml-auto text-xs bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded-full">
                          {tasks?.filter(t => t?.listId === list?.id && !t?.archived).length || 0}
                        </span>
                      </button>
                    ))}

                    <button
                      onClick={() => setShowArchived(true)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        showArchived
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      <ApperIcon name="Archive" size={18} />
                      <span>Archived</span>
                      <span className="ml-auto text-xs bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded-full">
                        {tasks?.filter(t => t?.archived).length || 0}
                      </span>
                    </button>
                  </div>
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-6">
            <MainFeature
              tasks={filteredTasks}
              lists={lists}
              selectedList={selectedList}
              showArchived={showArchived}
              searchQuery={searchQuery}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskCreate={handleTaskCreate}
              getListName={getListName}
              getListColor={getListColor}
            />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Home