import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
    .then(data => {
      this.#database = JSON.parse(data)
    })
    .catch(() => {
      this.#persist()
    })
  }

  #persist() {
    try {
      fs.writeFile(databasePath, JSON.stringify(this.#database))
    } catch (error) {
      console.error('ocorreu erro', error)
      throw new Error('ocorreu erro', error)
    } 
  }

  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].includes(value)
        })
      })
    }

    return data
  }



  insert(table, data) {
    if(Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }
    
    this.#persist();
    return data
  }

  insertRange(table, dataArray) {
    if(Array.isArray(this.#database[table])) {
      this.#database[table] = this.#database[table].concat(dataArray)
    } else {
      this.#database[table] = [dataArray]
    }
    
    this.#persist();
    return dataArray
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { id, ...data}
      this.#persist()
    }
  }
}
