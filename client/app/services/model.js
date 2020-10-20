import { isString, get, find } from "lodash";
import sanitize from "@/services/sanitize";
//import { axios } from "@/services/axios";
import notification from "@/services/notification";

function getErrorMessage(error) {
  return find([get(error, "response.data.message"), get(error, "response.statusText"), "Unknown error"], isString);
}
const configYAML = "customization:\n" +
  "  urlShortener: |\n" +
  "    return request.get('http://tinyurl.com/api-create.php?url=' + encodeURIComponent(url))\n" +
  "dataCubes:\n" +
  "  - name: wiki\n" +
  "    title: Wikipedia Example\n" +
  "    description: |\n" +
  "      Data cube with *Wikipedia* data.\n" +
  "      ---\n" +
  "      Contains data about Wikipedia editors and articles with information about edits, comments and article metadata\n" +
  "\n" +
  "      *Based on wikiticker from 2015-09-12*\n" +
  "    clusterName: native\n" +
  "    source: assets/data/wikiticker-2015-09-12-sampled.json\n" +
  "    timeAttribute: time\n" +
  "\n" +
  "    refreshRule:\n" +
  "      rule: fixed\n" +
  "      time: 2015-09-13T00:00:00.000Z\n" +
  "\n" +
  "    defaultDuration: P1D\n" +
  "    defaultSortMeasure: added\n" +
  "    defaultSelectedMeasures: [\"added\"]\n" +
  "\n" +
  "    defaultPinnedDimensions: [\"channel\",\"namespace\",\"isRobot\"]\n" +
  "    introspection: no-autofill\n" +
  "    attributeOverrides:\n" +
  "      - name: sometimeLater\n" +
  "        type: TIME\n" +
  "\n" +
  "      - name: commentLength\n" +
  "        type: NUMBER\n" +
  "\n" +
  "      - name: deltaBucket100\n" +
  "        type: NUMBER\n" +
  "\n" +
  "    dimensions:\n" +
  "      - name: time\n" +
  "        title: Time\n" +
  "        kind: time\n" +
  "        formula: $time\n" +
  "\n" +
  "      - name: channel\n" +
  "        title: Channel\n" +
  "        formula: $channel\n" +
  "\n" +
  "      - name: cityName\n" +
  "        title: City Name\n" +
  "        formula: $cityName\n" +
  "\n" +
  "      - name: comments\n" +
  "        title: Comments\n" +
  "        dimensions:\n" +
  "\n" +
  "          - name: comment\n" +
  "            title: Comment\n" +
  "            formula: $comment\n" +
  "\n" +
  "          - name: commentLengths\n" +
  "            title: Comment Lengths\n" +
  "            description: Length of the comment\n" +
  "            dimensions:\n" +
  "\n" +
  "              - name: commentLength\n" +
  "                title: Comment Length\n" +
  "                kind: number\n" +
  "                description: |\n" +
  "                  Lengths of *all* comments\n" +
  "                formula: $commentLength\n" +
  "\n" +
  "              - name: commentLengthOver100\n" +
  "                title: Comment Length Over 100\n" +
  "                description: |\n" +
  "                  `true` only if comment length is over `100`\n" +
  "                kind: boolean\n" +
  "                formula: $commentLength > 100\n" +
  "\n" +
  "      - name: countryIso\n" +
  "        title: Country ISO\n" +
  "        formula: $countryIsoCode\n" +
  "\n" +
  "      - name: countryName\n" +
  "        title: Country Name\n" +
  "        formula: $countryName\n" +
  "\n" +
  "      - name: deltaBucket100\n" +
  "        title: Delta Bucket\n" +
  "        kind: number\n" +
  "        formula: $deltaBucket100\n" +
  "\n" +
  "      - name: isAnonymous\n" +
  "        title: Is Anonymous\n" +
  "        kind: boolean\n" +
  "        formula: $isAnonymous\n" +
  "\n" +
  "      - name: isMinor\n" +
  "        title: Is Minor\n" +
  "        kind: boolean\n" +
  "        formula: $isMinor\n" +
  "\n" +
  "      - name: isNew\n" +
  "        title: Is New\n" +
  "        kind: boolean\n" +
  "        formula: $isNew\n" +
  "\n" +
  "      - name: isRobot\n" +
  "        title: Is Robot\n" +
  "        kind: boolean\n" +
  "        formula: $isRobot\n" +
  "\n" +
  "      - name: isUnpatrolled\n" +
  "        title: Is Unpatrolled\n" +
  "        formula: $isUnpatrolled\n" +
  "\n" +
  "      - name: metroCode\n" +
  "        title: Metro Code\n" +
  "        formula: $metroCode\n" +
  "\n" +
  "      - name: namespace\n" +
  "        title: Namespace\n" +
  "        formula: $namespace\n" +
  "\n" +
  "      - name: page\n" +
  "        title: Page\n" +
  "        formula: $page\n" +
  "\n" +
  "      - name: regionIso\n" +
  "        title: Region ISO\n" +
  "        formula: $regionIsoCode\n" +
  "\n" +
  "      - name: regionName\n" +
  "        title: Region Name\n" +
  "        formula: $regionName\n" +
  "\n" +
  "      - name: user\n" +
  "        title: User\n" +
  "        formula: $user\n" +
  "\n" +
  "      - name: userChars\n" +
  "        title: User Chars\n" +
  "        formula: $userChars\n" +
  "\n" +
  "    measures:\n" +
  "      - name: rowsAndDeltas\n" +
  "        title: Rows & Deltas\n" +
  "        measures:\n" +
  "\n" +
  "          - name: count\n" +
  "            title: Rows\n" +
  "            formula: $main.count()\n" +
  "\n" +
  "          - name: deltas\n" +
  "            title: Deltas\n" +
  "            measures:\n" +
  "\n" +
  "              - name: delta\n" +
  "                title: Delta\n" +
  "                formula: $main.sum($delta)\n" +
  "\n" +
  "              - name: avg_delta\n" +
  "                title: Avg Delta\n" +
  "                formula: $main.average($delta)\n" +
  "\n" +
  "      - name: added\n" +
  "        title: Added\n" +
  "        description: |\n" +
  "          Sum of all additions\n" +
  "        formula: $main.sum($added)\n" +
  "\n" +
  "      - name: avg_added\n" +
  "        title: Avg Added\n" +
  "        formula: $main.average($added)\n" +
  "\n" +
  "      - name: deleted\n" +
  "        title: Deleted\n" +
  "        description: |\n" +
  "          Sum of all deletions\n" +
  "        formula: $main.sum($deleted)\n" +
  "\n" +
  "      - name: avg_deleted\n" +
  "        title: Avg Deleted\n" +
  "        formula: $main.average($deleted)\n" +
  "\n" +
  "      - name: unique_users\n" +
  "        title: Unique Users\n" +
  "        formula: $main.countDistinct($user)\n"
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

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
const axios = {
  query:  (params) => {
    return new Promise((resolve, reject) => {
      getStorageItem('models', (response) => {
        response = response ? JSON.parse(response) : [];
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
        response = response ? JSON.parse(response) : [];
        resolve(response.find(x => x.id === id));
      })
    });
  },
  create: (item) => {
    return new Promise((resolve, reject) => {
      getStorageItem('models', (response) => {
        response = response ? JSON.parse(response) : [];
        let data = []
        if (response) {
          data = response;
        }
        item.id = uuidv4();
        item.config = configYAML;
        data.push(item);
        setStorageItem('models', data, () => {
          resolve(item);
        })
      })
    });
  },
  save: (item, id) => {
    return new Promise((resolve, reject) => {
      getStorageItem('models', (response) => {
        response = response ? JSON.parse(response) : []
        let data = []
        response.forEach((model) => {
          if (model.id === id) {
            data.push(Object.assign({}, model, item));
          } else {
            data.push(model);
          }
        })
        setStorageItem('models', data, () => {
          resolve(Object.assign({id}, item));
        })
      })
    });
  },
  delete: (model) => {
    return new Promise((resolve, reject) => {
      getStorageItem('models', (response) => {
        response = response ? JSON.parse(response) : [];
        response = response.filter((item) => model.id !== item.id)
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
  get: (id) => axios.get(id),
  create: data => axios.create(data),
  save: (data, id) => axios.save(data, id),
  deleteModel: axios.delete,
};

export default Model;
