import { axios } from "@/services/axios";

const AIQuery = {
  generate: (data) => axios.post("/api/ai/query", data),
  providers: () => axios.get("/api/ai/providers"),
};

export default AIQuery;
