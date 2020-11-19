import { isString, get, find } from "lodash";
import sanitize from "@/services/sanitize";
import { axios } from "@/services/axios";
import notification from "@/services/notification";

function getErrorMessage(error) {
  return find([get(error, "response.data.message"), get(error, "response.statusText"), "Unknown error"], isString);
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


const Model = {
  query: params => axios.get("api/models", { params }),
  get: (id) => axios.get(`api/models/${id}`),
  create: data => axios.post(`api/models`, data),
  save: data => axios.post(`api/models/${data.id}`, data),
  deleteModel,
};

export default Model;
