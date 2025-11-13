<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="custom-header text-white ">
      <!-- <q-toolbar style="height: 15px; min-height: 10px">
        <q-space />
        <div>helloworld</div>
        <q-space />
      </q-toolbar> -->
      <q-toolbar :style="{ height: headerHeight, minHeight: headerHeight }">
        <!-- 公司Logo -->
        <q-img src="~assets/logo.png" :style="{ height: logoSize, width: logoSize }" class="drag-region q-mr-sm" />

        <!-- 公司名称 -->
        <q-toolbar-title class="drag-region text-weight-bold"> IOT Platform </q-toolbar-title>

        <!-- 导航菜单 -->
        <q-tabs
          v-model="tab"
          class="text-white custom-tabs"
          active-color="yellow"
          align="left"
          :style="{ height: headerHeight, minHeight: headerHeight }"
        >
          <q-route-tab
            v-for="item in navigation"
            :key="item.name"
            :name="item.name"
            :to="item.path ? `/${item.path}` : '/'"
            :label="item.label"
          />
        </q-tabs>

        <q-space />

        <!-- 配色方案选择 -->
        <q-btn flat dense round icon="palette" class="q-mr-sm">
          <q-menu>
            <q-list style="max-width: 120px">
              <!-- <q-item-label header>主题配色</q-item-label> -->
              <q-item
                v-for="theme in themeList"
                :key="theme.key"
                clickable
                v-close-popup
                @click="changeTheme(theme.key)"
                :active="currentTheme === theme.key"
              >
                <q-item-section avatar>
                  <q-icon name="circle" :style="{ color: theme.colors.primary }" />
                </q-item-section>
                <q-item-section>{{ theme.name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- 主题切换 -->
        <q-btn
          flat
          dense
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          @click="$q.dark.toggle()"
          class="q-mr-sm"
        />

        <!-- 用户头像 -->
        <q-btn flat round dense>
          <q-avatar :size="`${layoutConfig.logoSize * 0.8}px`">
            <img src="https://cdn.quasar.dev/img/avatar.png" />
          </q-avatar>
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="onProfile">
                <q-item-section>个人信息</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="onLogout">
                <q-item-section>退出登录</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- 全屏模式 -->
        <q-btn
          flat
          dense
          round
          :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="toggleFullscreen"
          class="q-mr-sm"
        />

        <!--关闭按钮-->
        <q-btn v-if="isWailsDev"
          flat
          dense
          round
          color="red"
          text-color="white"
          icon="cancel"
          @click="onExit"
          class="q-mr-sm"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import navigation from 'src/config/nav_menu'
import { applyTheme, saveTheme, initTheme, getThemeList, layoutConfig } from 'src/config/theme'

import { isWailsDev } from 'src/config/env'

const $q = useQuasar()
const tab = ref('dashboard')
const isFullscreen = ref(false)
const currentTheme = ref('blue')
const themeList = getThemeList()

// 从配置中获取布局尺寸
const headerHeight = computed(() => `${layoutConfig.headerHeight}px`)
const logoSize = computed(() => `${layoutConfig.logoSize}px`)

// 切换配色方案
const changeTheme = (theme) => {
  currentTheme.value = theme
  saveTheme(theme)
  applyTheme(theme, $q)
}

// 初始化配色方案
onMounted(() => {
  currentTheme.value = initTheme($q)
})

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    isWailsDev ? window.runtime.WindowFullscreen() : document.documentElement.requestFullscreen()
  } else {
    isWailsDev ? window.runtime.WindowUnfullscreen() : document.exitFullscreen()
  }
}

// 退出
const onExit = () => {
  if (isWailsDev) {
    window.runtime.WindowMinimise()
  }
}

// 个人信息
const onProfile = () => {
  // TODO: 实现个人信息页面跳转
}

// 退出登录
const onLogout = () => {
  // TODO: 实现退出登录逻辑
}
</script>

<style lang="scss">
.q-layout {
  min-height: 100vh;
}

.q-page-container {
  padding: 0;
}

// Header 背景色：根据明暗模式使用不同的主题色
//header-bg-light, header-bg-dark为quasar变量，需要添加前缀--q-
body.body--light .custom-header {
  background: var(--q-header-bg-light, #1976D2) !important;
}

body.body--dark .custom-header {
  background: var(--q-header-bg-dark, #1565C0) !important;
}

//设置q-page-container背景渐变
// body.body--light .q-page-container {
//   background: linear-gradient(135deg, #ffffff 0%, #d5d5d5 100%);
// }

// body.body--dark .q-page-container {
//   background: linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%);
// }

// 主题色应用到其他组件
.q-btn--standard {
  transition: all 0.3s ease;
}

// 确保页面内容采用全屏布局（使用 CSS 变量）
.q-page {
  padding: 16px;
  min-height: calc(100vh - var(--header-height, 40px) - 10px);
}

// 表格分页组件固定在底部
.q-table__bottom {
  position: sticky;
  bottom: 0;
  z-index: 1;
}

// Card 组件全局 padding
.q-card {
  padding: 8px;
}

// 修复导航标签文字垂直居中（使用 CSS 变量）
.custom-tabs .q-tab {
  min-height: var(--header-height, 40px);
  height: var(--header-height, 40px);
  padding: 0 16px;
}

.custom-tabs .q-tab__content {
  min-height: var(--header-height, 40px);
  height: var(--header-height, 40px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-tabs .q-tab__label {
  line-height: var(--header-height, 40px);
}

/* 拖拽区域样式 */
.drag-region {
    --wails-draggable: drag;
    --webkit-app-region: drag;
    cursor: move;
}
</style>
