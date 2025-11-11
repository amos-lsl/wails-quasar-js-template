// 导航与路由的统一配置
// 每项用于生成顶部标签和主路由 children
export default [
  { name: 'dashboard', path: '', label: '首页', component: 'pages/IndexPage.vue' },
  { name: 'page2', path: 'page2', label: '菜单2', component: 'pages/PageTwo.vue' },
]