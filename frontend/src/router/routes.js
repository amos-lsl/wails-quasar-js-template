import navigation from 'src/config/nav_menu'

// 使用 Vite 的 import.meta.glob 进行组件映射，确保可被打包器正确解析
const pageModules = import.meta.glob('/src/pages/**/*.vue')

const toSrcPath = (p) => (p.startsWith('pages/') ? `/src/${p}` : p)

const mainChildren = navigation.map((item) => {
  const key = toSrcPath(item.component)
  const loader = pageModules[key]
  if (!loader) {
    console.warn(`[router] 未找到页面组件: ${key}`)
  }
  return {
    path: item.path,
    name: item.name,
    component: loader,
  }
})

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: mainChildren,
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
