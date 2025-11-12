import { isDev } from "src/config/env"

export const requestInterceptor = (config) => {
    // 添加请求时间戳
    config.metadata = { startTime: Date.now() }
    
    // 添加认证Token（如果存在）
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 开发环境下打印请求信息
    if (isDev) {
      console.log('🚀 API请求:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data
      })
    }
    return config
}

export const requestError = (error) => {
    console.error('❌ 请求配置错误:', error)
    return Promise.reject(error)
}

export const responseInterceptor = (response) => {
    // 计算请求耗时
    const duration = Date.now() - response.config.metadata?.startTime
    
    // 开发环境下打印响应信息
    if (isDev) {
      console.log('✅ API响应:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: `${duration}ms`,
        dataSize: JSON.stringify(response.data).length
      })
    }
    
    // 统一处理成功响应
    if (response.data?.success === false) {
      throw new Error(response.data?.message || '请求失败')
    }
    
    return response
}

export const responseError = (error) => {
    // 统一处理错误响应
    if (error.response) {
      const { status, data } = error.response
      
      // 根据状态码进行不同处理
      switch (status) {
        case 401:
          // 未授权，清除token并跳转登录
          clearAuthToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          throw new Error('登录已过期，请重新登录')
          
        case 403:
          throw new Error('没有权限访问该资源')
          
        case 404:
          throw new Error('请求的资源不存在')
          
        case 429:
          throw new Error('请求过于频繁，请稍后再试')
          
        case 500:
          throw new Error('服务器内部错误')
          
        default:
          throw new Error(data?.message || `HTTP ${status}`)
      }
    } else if (error.request) {
      // 网络错误
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      throw new Error(error.message || '未知错误')
    }
}

export const createError = (message, originalError = null) => {
  const error = new Error(message)
  if (originalError) {
    error.original = originalError
    error.code = originalError.code
  }
  return error
}

export const setAuthToken = (token) => {
  if (token) {
      localStorage.setItem('authToken', token)
    }
}

export const clearAuthToken = () => {
  localStorage.removeItem('authToken')
  sessionStorage.removeItem('authToken')
}
