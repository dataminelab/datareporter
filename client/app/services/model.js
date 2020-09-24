import { isString, get, find } from "lodash";
import sanitize from "@/services/sanitize";
//import { axios } from "@/services/axios";
import notification from "@/services/notification";

function getErrorMessage(error) {
  return find([get(error, "response.data.message"), get(error, "response.statusText"), "Unknown error"], isString);
}
// TODO template remove after
function getStorageItem(key, callback) {

  if (typeof callback !== 'function') throw new Error('Invalid callback handler');

  const result = localStorage.getItem(key);

  if (result instanceof window.Promise) {
    result.then(callback);
  }
  else {
    callback(result);
  }
}

function setStorageItem(key, value, callback) {
  value = JSON.stringify(value);
  const result = localStorage.setItem(key, value);

  if (result instanceof window.Promise && callback) {
    result.then(callback);
  }
  else if (callback) {
    callback();
  }
}

const axios = {
  query:  (params) => {
    return new Promise((resolve, reject) => {
      getStorageItem('models', (response) => {
        response = JSON.parse(response);
        if (response) {
          resolve({
            count: response.length,
            page: 1,
            page_size: 20,
            results: response
          });
        } else {
          resolve({
            count: [].length,
            page: 1,
            page_size: 20,
            results: []
          });
        }
      })
    })
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      getStorageItem('models', (response) => {
        response = JSON.parse(response);
        resolve(response.find(x => x.id === id));
      })
    });
  },
  create: (item) => {
    return new Promise((resolve, reject) => {
      getStorageItem('models', (response) => {
        response = JSON.parse(response);
        let data = []
        if (response) {
          data = response;
        }
        data.push(item);
        setStorageItem('models', data, () => {
          resolve(item);
        })
      })
    });
  },
  save: (item) => {
    return new Promise((resolve, reject) => {
      getStorageItem('models', (response) => {
        response = JSON.parse(response);
        let data = []
        if (response) {
          data = response;
        }
        data.map((model) => {
          if (model.id === item.id) {
            return Object.assign({}, model, item);
          } else {
            return model;
          }
        })
        setStorageItem('models', data, () => {
          resolve(item);
        })
      })
    });
  },
  delete: (model) => {
    return new Promise((resolve, reject) => {
      getStorageItem('models', (response) => {
        response = JSON.parse(response);
        response = response.filter((item) => model.id === item.connection)
        console.log(response)
        setStorageItem('models', response, () => {
          resolve(model.id);
        })
      })
    });
  },
}

function deleteModel(model) {
  const modelName = sanitize(model.name);
  return axios
    .delete(`api/models/${model.id}`)
    .then(data => {
      notification.warning(`Model ${modelName} has been deleted.`);
      return data;
    })
    .catch(error => {
      notification.error("Cannot delete model", getErrorMessage(error));
    });
}


/*const Model = {
  query: params => axios.get("api/models", { params }),
  get: ({ id }) => axios.get(`api/models/${id}`),
  create: data => axios.post(`api/models`, data),
  save: data => axios.post(`api/models/${data.id}`, data),
  deleteModel,
};*/

const Model = {
  query: params => axios.query(params),
  get: ({ id }) => axios.get(id),
  create: data => axios.create(data),
  save: data => axios.save(data),
  deleteModel: axios.delete,
};

export default Model;
