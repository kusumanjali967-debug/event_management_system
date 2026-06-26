const bcrypt = require('bcryptjs');

// In-memory collection database
const database = {
  User: [],
  Event: [],
  Booking: []
};

// Define Schema mock
class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this.methods = {};
    this.preHooks = {};
  }

  pre(hook, fn) {
    this.preHooks[hook] = fn;
  }
}

Schema.Types = {
  ObjectId: String
};

// Define Query mock
class Query {
  constructor(modelName, results) {
    this.modelName = modelName;
    this.results = results;
  }

  async exec() {
    return this.results;
  }

  then(onResolve, onReject) {
    return Promise.resolve(this.results).then(onResolve, onReject);
  }

  populate(path, select) {
    if (Array.isArray(this.results)) {
      this.results = this.results.map((doc) => this._populateDoc(doc, path));
    } else if (this.results) {
      this.results = this._populateDoc(this.results, path);
    }
    return this;
  }

  _populateDoc(doc, path) {
    if (!doc) return doc;
    const refId = doc[path];
    if (!refId) return doc;

    let targetModel = '';
    if (path === 'organizer') targetModel = 'User';
    if (path === 'user') targetModel = 'User';
    if (path === 'event') targetModel = 'Event';

    if (targetModel && database[targetModel]) {
      const idToSearch = refId._id ? refId._id.toString() : refId.toString();
      const refDoc = database[targetModel].find((item) => item._id === idToSearch);
      if (refDoc) {
        // Return a copy with populated field
        const copy = Object.create(Object.getPrototypeOf(doc));
        Object.assign(copy, doc);
        copy[path] = refDoc;
        return copy;
      }
    }
    return doc;
  }

  sort(criteria) {
    if (Array.isArray(this.results)) {
      if (criteria.date || criteria.bookingDate) {
        this.results.sort((a, b) => new Date(a.date || a.bookingDate) - new Date(b.date || b.bookingDate));
      }
    }
    return this;
  }

  select(fields) {
    return this;
  }
}

// Define Document base mock
class Document {
  constructor(modelName, data, schema) {
    Object.assign(this, data);
    this._modelName = modelName;
    this._schema = schema;
    
    if (!this._id) {
      this._id = 'mock_id_' + Math.random().toString(36).substr(2, 9);
    }
    if (!this.id) {
      this.id = this._id;
    }
    this.createdAt = new Date();
    this.updatedAt = new Date();

    // Bind methods
    if (schema && schema.methods) {
      Object.keys(schema.methods).forEach((method) => {
        this[method] = schema.methods[method].bind(this);
      });
    }
  }

  async save() {
    // Run pre-save hooks
    if (this._schema && this._schema.preHooks['save']) {
      const hookFn = this._schema.preHooks['save'];
      await new Promise((resolve) => hookFn.call(this, resolve));
    }

    const list = database[this._modelName];
    const idx = list.findIndex((doc) => doc._id === this._id);
    if (idx >= 0) {
      list[idx] = this;
    } else {
      list.push(this);
    }
    return this;
  }

  isModified(path) {
    return true;
  }

  toString() {
    return this._id;
  }
}

// Function to generate Model classes dynamically
function createModel(modelName, schema) {
  database[modelName] = []; // Initialize collection array

  class Model extends Document {
    constructor(data) {
      super(modelName, data, schema);
    }

    static find(query = {}) {
      let list = database[modelName];
      if (query.organizer) {
        list = list.filter((item) => item.organizer && item.organizer.toString() === query.organizer.toString());
      }
      if (query.user) {
        list = list.filter((item) => item.user && item.user.toString() === query.user.toString());
      }
      if (query.event) {
        const queryEventId = query.event.$in ? query.event.$in.map(id => id.toString()) : [query.event.toString()];
        list = list.filter((item) => item.event && queryEventId.includes(item.event.toString()));
      }
      if (query.category && query.category !== 'All') {
        list = list.filter((item) => item.category === query.category);
      }
      if (query.title && query.title.$regex) {
        const regex = new RegExp(query.title.$regex, query.title.$options || 'i');
        list = list.filter((item) => regex.test(item.title));
      }
      // Return a copy list
      const results = list.map(item => item);
      return new Query(modelName, results);
    }

    static findOne(query = {}) {
      const list = database[modelName];
      let found = null;
      if (query.email) {
        found = list.find((item) => item.email && item.email.toLowerCase() === query.email.toLowerCase());
      }
      return new Query(modelName, found);
    }

    static findById(id) {
      const list = database[modelName];
      const found = list.find((item) => item._id === id);
      return new Query(modelName, found || null);
    }

    static async findByIdAndDelete(id) {
      const list = database[modelName];
      const idx = list.findIndex((item) => item._id === id);
      if (idx >= 0) {
        const removed = list.splice(idx, 1)[0];
        return removed;
      }
      return null;
    }

    static async create(data) {
      const doc = new Model(data);
      await doc.save();
      return doc;
    }
  }

  Model.modelName = modelName;
  return Model;
}

const mockMongoose = {
  Schema,
  Types: {
    ObjectId: String
  },
  model: function (name, schema) {
    return createModel(name, schema);
  },
  connect: async function () {
    console.log('Using in-memory Mock Database');
    return { connection: { host: 'in-memory-mock' } };
  }
};

module.exports = mockMongoose;
