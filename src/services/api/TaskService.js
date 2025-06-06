import taskData from '../mockData/Task.json'

class TaskServiceClass {
  constructor() {
    this.tasks = [...taskData]
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.tasks]
  }

  async getById(id) {
    await this.delay()
    const task = this.tasks.find(task => task.id === id)
    return task ? { ...task } : null
  }

  async create(taskData) {
    await this.delay()
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.tasks.push(newTask)
    return { ...newTask }
  }

  async update(id, taskData) {
    await this.delay()
    const index = this.tasks.findIndex(task => task.id === id)
    if (index === -1) {
      throw new Error('Task not found')
    }
    this.tasks[index] = {
      ...this.tasks[index],
      ...taskData,
      updatedAt: new Date().toISOString()
    }
    return { ...this.tasks[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.tasks.findIndex(task => task.id === id)
    if (index === -1) {
      throw new Error('Task not found')
    }
    this.tasks.splice(index, 1)
    return true
  }
}

export const TaskService = new TaskServiceClass()