import listData from '../mockData/List.json'

class ListServiceClass {
  constructor() {
    this.lists = [...listData]
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.lists]
  }

  async getById(id) {
    await this.delay()
    const list = this.lists.find(list => list.id === id)
    return list ? { ...list } : null
  }

  async create(listData) {
    await this.delay()
    const newList = {
      ...listData,
      id: Date.now().toString(),
      taskCount: 0,
      createdAt: new Date().toISOString()
    }
    this.lists.push(newList)
    return { ...newList }
  }

  async update(id, listData) {
    await this.delay()
    const index = this.lists.findIndex(list => list.id === id)
    if (index === -1) {
      throw new Error('List not found')
    }
    this.lists[index] = {
      ...this.lists[index],
      ...listData
    }
    return { ...this.lists[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.lists.findIndex(list => list.id === id)
    if (index === -1) {
      throw new Error('List not found')
    }
    this.lists.splice(index, 1)
    return true
  }
}

export const ListService = new ListServiceClass()