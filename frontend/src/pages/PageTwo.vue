<template>
  <q-page>
    <div class="q-pa-md">
      <!-- 页面标题和操作按钮 -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-weight-bold">规则引擎</div>
        <div class="row q-gutter-md">
          <q-btn color="primary" icon="add" label="新建规则" @click="onCreateRule" />
          <q-btn color="secondary" icon="play_arrow" label="测试规则" @click="testDialog = true" />
        </div>
      </div>

      <!-- 规则列表 -->
      <q-card>
        <q-table
          :rows="rules"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          :filter="search"
          binary-state-sort
        >
          <!-- 状态列 -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.value)"
                text-color="white"
                dense
                class="q-ml-none"
              >
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn flat round dense color="primary" icon="edit" @click="onEditRule(props.row)">
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                :color="props.row.status === '启用' ? 'negative' : 'positive'"
                :icon="props.row.status === '启用' ? 'stop' : 'play_arrow'"
                @click="onToggleRule(props.row)"
              >
                <q-tooltip>{{ props.row.status === '启用' ? '停用' : '启用' }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="onDeleteRule(props.row)"
              >
                <q-tooltip>删除</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- 规则配置对话框 -->
    <q-dialog v-model="ruleDialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ isEdit ? '编辑规则' : '新建规则' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSaveRule" class="q-gutter-md">
            <q-input
              v-model="currentRule.name"
              label="规则名称"
              :rules="[(val) => !!val || '请输入规则名称']"
            />
            <q-select
              v-model="currentRule.triggerType"
              :options="triggerTypeOptions"
              label="触发类型"
              :rules="[(val) => !!val || '请选择触发类型']"
            />
            <q-select
              v-model="currentRule.deviceType"
              :options="deviceTypeOptions"
              label="设备类型"
              :rules="[(val) => !!val || '请选择设备类型']"
            />
            <q-input
              v-model="currentRule.condition"
              label="触发条件"
              type="textarea"
              :rules="[(val) => !!val || '请输入触发条件']"
            />
            <q-input
              v-model="currentRule.action"
              label="执行动作"
              type="textarea"
              :rules="[(val) => !!val || '请输入执行动作']"
            />
            <q-toggle v-model="currentRule.enabled" label="启用规则" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="保存" color="primary" @click="onSaveRule" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 规则测试对话框 -->
    <q-dialog v-model="testDialog">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">规则测试</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="onTestRule" class="q-gutter-md">
            <q-select
              v-model="testData.deviceType"
              :options="deviceTypeOptions"
              label="设备类型"
              :rules="[(val) => !!val || '请选择设备类型']"
            />
            <q-input
              v-model="testData.data"
              label="测试数据"
              type="textarea"
              :rules="[(val) => !!val || '请输入测试数据']"
            />
          </q-form>
        </q-card-section>

        <q-card-section v-if="testResult">
          <div class="text-subtitle2">测试结果</div>
          <q-card flat bordered>
            <q-card-section>
              <pre>{{ testResult }}</pre>
            </q-card-section>
          </q-card>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="关闭" color="primary" v-close-popup />
          <q-btn flat label="测试" color="primary" @click="onTestRule" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 表格列定义
const columns = [
  { name: 'id', label: '规则ID', field: 'id', sortable: true },
  { name: 'name', label: '规则名称', field: 'name' },
  { name: 'triggerType', label: '触发类型', field: 'triggerType' },
  { name: 'deviceType', label: '设备类型', field: 'deviceType' },
  { name: 'condition', label: '触发条件', field: 'condition' },
  { name: 'action', label: '执行动作', field: 'action' },
  { name: 'status', label: '状态', field: 'status', sortable: true },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' },
]

// 选项数据
const triggerTypeOptions = [
  { label: '数据阈值', value: 'threshold' },
  { label: '状态变化', value: 'state_change' },
  { label: '定时触发', value: 'schedule' },
  { label: '设备事件', value: 'event' },
]

const deviceTypeOptions = [
  { label: '传感器', value: 'sensor' },
  { label: '控制器', value: 'controller' },
  { label: '网关', value: 'gateway' },
]

// 数据
const loading = ref(false)
const search = ref('')
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})

// 模拟规则数据
const rules = ref([
  {
    id: 'RULE001',
    name: '温度过高告警',
    triggerType: 'threshold',
    deviceType: 'sensor',
    condition: 'temperature > 40',
    action: 'send_alert("温度过高")',
    status: '启用',
  },
  {
    id: 'RULE002',
    name: '设备离线通知',
    triggerType: 'state_change',
    deviceType: 'gateway',
    condition: 'status == "offline"',
    action: 'send_notification("设备离线")',
    status: '停用',
  },
])

// 规则对话框相关
const ruleDialog = ref(false)
const isEdit = ref(false)
const currentRule = ref({
  name: '',
  triggerType: null,
  deviceType: null,
  condition: '',
  action: '',
  enabled: true,
})

// 规则测试相关
const testDialog = ref(false)
const testData = ref({
  deviceType: null,
  data: '',
})
const testResult = ref(null)

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    启用: 'positive',
    停用: 'negative',
  }
  return colors[status] || 'grey'
}

// 新建规则
const onCreateRule = () => {
  isEdit.value = false
  currentRule.value = {
    name: '',
    triggerType: null,
    deviceType: null,
    condition: '',
    action: '',
    enabled: true,
  }
  ruleDialog.value = true
}

// 编辑规则
const onEditRule = (rule) => {
  isEdit.value = true
  currentRule.value = { ...rule }
  ruleDialog.value = true
}

// 保存规则
const onSaveRule = () => {
  // TODO: 实现保存逻辑
  $q.notify({
    type: 'positive',
    message: isEdit.value ? '规则已更新' : '规则已创建',
  })
  ruleDialog.value = false
}

// 切换规则状态
const onToggleRule = (rule) => {
  const newStatus = rule.status === '启用' ? '停用' : '启用'
  $q.dialog({
    title: '确认操作',
    message: `确定要${newStatus}规则"${rule.name}"吗？`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // TODO: 实现状态切换逻辑
    $q.notify({
      type: 'positive',
      message: `规则已${newStatus}`,
    })
  })
}

// 删除规则
const onDeleteRule = (rule) => {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除规则"${rule.name}"吗？`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // TODO: 实现删除逻辑
    $q.notify({
      type: 'positive',
      message: '规则已删除',
    })
  })
}

// 测试规则
const onTestRule = () => {
  // TODO: 实现规则测试逻辑
  testResult.value = {
    matched: true,
    triggeredRules: [
      {
        id: 'RULE001',
        name: '温度过高告警',
        result: '触发告警：温度过高',
      },
    ],
  }
}
</script>
