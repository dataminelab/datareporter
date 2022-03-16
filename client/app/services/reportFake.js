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
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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
  getList:  (params) => {
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
        const response = JSON.parse(res);
        let data = []
        if (res) {
          data = response;
        }
        let itemData = {
          id: uuidv4(),
          can_edit: item.can_edit,
          data_source_id: item.data_source_id,
          latest_report_data: item.latest_report_data,
          latest_report_data_id: item.latest_report_data_id,
          name: item.name,
          options: item.options,
          report: item.report,
          schedule: item.schedule,
          tags: item.tags,
          user: item.user
        }
        data.push(itemData);
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
  getList: params => axios.getList(params),
  get: ({ id }) => axios.get(id),
  create: data => axios.create(data),
  save: data => axios.save(data),
  deleteReport: axios.delete,
};

export default Report;
