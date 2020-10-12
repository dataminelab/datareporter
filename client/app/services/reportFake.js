import { isString, get, find } from "lodash";
import sanitize from "@/services/sanitize";
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
  const newValue = JSON.stringify(value);
  const result = localStorage.setItem(key, newValue);

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
      getStorageItem('reportDB', (res) => {
        const response = res ? JSON.parse(res) : [];
        if (res) {
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
      getStorageItem('reportDB', (res) => {
        const response = res ? JSON.parse(res) : [];
        resolve(response.find(x => x.id === id));
      })
    });
  },
  create: (item) => {
    return new Promise((resolve, reject) => {
      getStorageItem('reportDB', (res) => {
        const response = res ? JSON.parse(res) : [];
        let data = []
        if (res) {
          data = response;
        }
        data.push(item);
        setStorageItem('reportDB', data, () => {
          resolve(item);
        })
      })
    });
  },
  save: (item) => {
    return new Promise((resolve, reject) => {
      getStorageItem('reportDB', (res) => {
        const response = res ? JSON.parse(res) : [];
        let data = []
        if (res) {
          data = response;
        }
        data.map((model) => {
          if (model.id === item.id) {
            return Object.assign({}, model, item);
          } else {
            return model;
          }
        })
        setStorageItem('reportDB', data, () => {
          resolve(item);
        })
      })
    });
  },
  delete: (model) => {
    return new Promise((resolve, reject) => {
      getStorageItem('reportDB', (res) => {
        let response = res ? JSON.parse(res) : [];
        response = response.filter((item) => model.id === item.connection)
        console.log(res)
        setStorageItem('reportDB', response, () => {
          resolve(model.id);
        })
      })
    });
  },
}

function deleteReport(model) {
  const modelName = sanitize(model.name);
  return axios
    .delete(`api/reportDB/${model.id}`)
    .then(data => {
      notification.warning(`Report ${modelName} has been deleted.`);
      return data;
    })
    .catch(error => {
      notification.error("Cannot delete model", getErrorMessage(error));
    });
}


/*const Report = {
  query: params => axios.get("api/reportDB", { params }),
  get: ({ id }) => axios.get(`api/reportDB/${id}`),
  create: data => axios.post(`api/reportDB`, data),
  save: data => axios.post(`api/reportDB/${data.id}`, data),
  deleteReport,
};*/

const Report = {
  query: params => axios.query(params),
  get: ({ id }) => axios.get(id),
  create: data => axios.create(data),
  save: data => axios.save(data),
  deleteReport: axios.delete,
};

export default Report;
