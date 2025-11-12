import { api } from "boot/axios";
import { requestInterceptor, requestError, 
        responseInterceptor, responseError, 
        setAuthToken, clearAuthToken,
        createError } from "./utils"
import { Notify } from "quasar";

// ================== 请求拦截器 ==================
api.interceptors.request.use(requestInterceptor, requestError)

// ================== 响应拦截器 ==================
api.interceptors.response.use(responseInterceptor, responseError)


// ================== 通用请求封装 ==================
async function request(config, options = {}) {
  const {
    showLoading = false,
    showError = true,
    retryCount = 0,
    retryDelay = 1000,
  } = options

  try {
    // 显示loading（如果需要）
    if (showLoading) {
      // 这里可以调用全局loading管理
      // store.dispatch('ui/setLoading', true)
    }
    const response = await api(config)
    // 返回 [data, null]
    return [response.data, null]
    
  } catch (error) {
    // 重试逻辑
    if (retryCount > 0 && error.code !== 'ECONNABORTED') {
      console.log(`🔄 重试请求 (剩余 ${retryCount} 次):`, config.url)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      return request(config, { ...options, retryCount: retryCount - 1 })
    }
    
    // 创建统一错误对象
    const err = createError(error.message, error)
    
    // 显示错误信息（如果需要）
    if (showError) {
      console.error('❌ API请求失败:', {
        url: config.url,
        method: config.method,
        error: error.message
      })
      // 这里可以调用全局错误处理
      Notify.create({
        color: "red-13",
        position: "top-right",
        message: error.message,
        timeout: 10000,
        //closeBtn: '关闭',
        actions: [
          {
            // 关闭按钮样式
            icon: 'cancel',
            color: 'white',
            class: 'q-btn--round'
          }
        ]  
      })
      
    }
    
    // 返回 [null, error]
    return [null, err]
    
  } finally {
    // 隐藏loading
    if (showLoading) {
      // store.dispatch('ui/setLoading', false)
    }
  }
}

// ================== 文件上传请求 ==================
async function uploadFile(url, file, options = {}) {
  const formData = new FormData()
  formData.append('file', file)
  
  if (options.data) {
    Object.entries(options.data).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }
  
  return request({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...options
  })
}

// ================== 文件下载请求 ==================
async function downloadFile(url, filename, options = {}) {
  try {
    const response = await api({
      method: 'GET',
      url,
      responseType: 'blob',
      ...options
    })
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    return [true, null]
  } catch (error) {
    return [null, createError('文件下载失败', error)]
  }
}

// ================== 批量请求 ==================
async function batchRequest(requests) {
  try {
    const promises = requests.map(config => 
      request(config).then(([data, error]) => ({ data, error }))
    )
    
    const results = await Promise.allSettled(promises)
    
    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return { data: null, error: createError('请求失败', result.reason) }
      }
    })
  } catch (error) {
    return [null, createError('批量请求失败', error)]
  }
}

// ================== 导出方法 ==================
export const http = {
  // 基础方法
  get: (url, config = {}, options = {}) => 
    request({ method: 'GET', url, ...config }, options),
    
  post: (url, data, config = {}, options = {}) => 
    request({ method: 'POST', url, data, ...config }, options),
    
  put: (url, data, config = {}, options = {}) => 
    request({ method: 'PUT', url, data, ...config }, options),
    
  patch: (url, data, config = {}, options = {}) => 
    request({ method: 'PATCH', url, data, ...config }, options),
    
  del: (url, config = {}, options = {}) => 
    request({ method: 'DELETE', url, ...config }, options),
  
  // 高级方法
  upload: uploadFile,
  download: downloadFile,
  batch: batchRequest,
  
  // 工具方法
  setAuthToken: setAuthToken,
  
  clearAuthToken: clearAuthToken,
  
  // 获取axios实例（用于特殊情况）
  instance: () => api,
}

// 默认导出
export default http