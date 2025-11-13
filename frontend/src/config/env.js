export const isWailsDev = window.runtime != undefined

export const isDev =  process.env.NODE_ENV === "development";

export const timeout = isDev ? 10000 : 20000

export const baseURL = isDev ? "http://127.0.0.1:9999" : "http://127.0.0.1:28888"
