import { setCssVar } from 'quasar'

// 布局配置
export const layoutConfig = {
  headerHeight: 40, // toolbar 高度
  logoSize: 32 // logo 尺寸
}

// 配色方案定义
export const themes = {
  blue: {
    primary: '#1976D2',
    secondary: '#26A69A',
    accent: '#9C27B0',
    positive: '#21BA45',
    negative: '#C10015',
    info: '#31CCEC',
    warning: '#F2C037',
    headerLight: '#1976D2',
    headerDark: '#1565C0'
  },
  purple: {
    primary: '#9C27B0',
    secondary: '#E91E63',
    accent: '#673AB7',
    positive: '#4CAF50',
    negative: '#F44336',
    info: '#2196F3',
    warning: '#FF9800',
    headerLight: '#9C27B0',
    headerDark: '#7B1FA2'
  }
}

// 主题名称映射
export const themeNames = {
  blue: '蓝色',
  purple: '紫色'
}

// 获取所有主题列表（用于动态渲染菜单）
export const getThemeList = () => {
  return Object.keys(themes).map(key => ({
    key,
    name: themeNames[key],
    colors: themes[key]
  }))
}

// 应用配色方案
export const applyTheme = (theme, $q) => {
  const colors = themes[theme]

  if (!colors) {
    console.warn(`Theme "${theme}" not found`)
    return
  }

  // 使用 Quasar 的 setCssVar 方法统一更新所有 CSS 变量
  setCssVar('primary', colors.primary)
  setCssVar('secondary', colors.secondary)
  setCssVar('accent', colors.accent)
  setCssVar('positive', colors.positive)
  setCssVar('negative', colors.negative)
  setCssVar('info', colors.info)
  setCssVar('warning', colors.warning)
  // Header 背景色（对应 MainLayout.vue 中的 .custom-header 样式）
  setCssVar('header-bg-light', colors.headerLight)
  setCssVar('header-bg-dark', colors.headerDark)

  // 显示通知
  if ($q) {
    $q.notify({
      message: `已切换到${themeNames[theme]}主题`,
      color: 'primary',
      position: 'top-right',
      timeout: 1000
    })
  }
}

// 应用布局配置到 CSS 变量
export const applyLayoutConfig = () => {
  document.documentElement.style.setProperty('--header-height', `${layoutConfig.headerHeight}px`)
  document.documentElement.style.setProperty('--logo-size', `${layoutConfig.logoSize}px`)
}

// 获取保存的主题
export const getSavedTheme = () => {
  return localStorage.getItem('app-theme') || 'blue'
}

// 保存主题
export const saveTheme = (theme) => {
  localStorage.setItem('app-theme', theme)
}

// 初始化主题
export const initTheme = () => {
  const savedTheme = getSavedTheme()
  applyTheme(savedTheme, null) // 初始化时不显示通知
  applyLayoutConfig() // 应用布局配置
  return savedTheme
}
