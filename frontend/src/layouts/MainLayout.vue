<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- 公司Logo -->
        <q-img src="~assets/logo.png" style="height: 40px; width: 40px" class="q-mr-sm" />

        <!-- 公司名称 -->
        <q-toolbar-title class="text-weight-bold"> IOT Platform </q-toolbar-title>

        <!-- 导航菜单 -->
        <q-tabs
          v-model="tab"
          class="text-white"
          active-color="white"
          indicator-color="white"
          align="left"
          narrow-indicator
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

        <!-- 主题切换 -->
        <q-btn
          flat
          dense
          round
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          @click="toggleTheme"
          class="q-mr-sm"
        />

        <!-- 全屏模式 -->
        <q-btn
          flat
          dense
          round
          :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="toggleFullscreen"
          class="q-mr-sm"
        />

        <!-- 用户头像 -->
        <q-btn flat round dense>
          <q-avatar size="32px">
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
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import navigation from 'src/config/nav_menu'

const $q = useQuasar()
const tab = ref('dashboard')
const isDark = ref(false)
const isFullscreen = ref(false)

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  $q.dark.toggle()
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
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
  background: #f5f5f5;
}

// 确保页面内容采用全屏布局
.q-page {
  padding: 16px;
  min-height: calc(100vh - 50px);
}

// 表格分页组件固定在底部
.q-table__bottom {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
}

// Card 组件全局 padding
.q-card {
  padding: 8px;
}
</style>
