import { http } from "../httpcli/method";

const version = () => {
  return http.get("/version");
};

export const ApiSeverInfo = {
  version,
};
