<template>
  <!-- 组件化table -->
  <div style="padding: 20px;">
    <h4>自定义列</h4>
      <!-- v-slot:default="data" 将父元素请求的数据传递过去 -->
    <u-table
      ref="tableRef"
      :data="listData"
      :columns="columns"
      :options="options"
      :operates="operates"
      @confirmEdit="confirmEdit"
    >
      <!-- 展开行信息 -->
      <template v-slot:expendRowRender="record">
        {{ record.row.description }}
      </template>
      <!-- 自定义列表 -->
      <template v-slot:customRender="{row, column}">
        <!-- <el-tooltip class="item" effect="dark" :content="row[column.prop]" placement="top-start">
          <el-button>上左</el-button>
        </el-tooltip> -->
        <el-popover
          placement="top-start"
          :title="column.prop"
          width="200"
          trigger="hover"
          :content="row[column.prop]"
        >
          <span slot="reference">{{ column.prop }}</span>
        </el-popover>

      </template>
      <!-- 自定义表头 -->
      <template v-slot:customHeader="{column}">
        <i class="el-icon-s-custom" />
        {{ column.label }}
      </template>
      <!-- <p slot="expendRowRender" slot-scope="row">
        {{ row.description }}
      </p> -->
    </u-table>
  </div>
</template>

<script>
import UTable from '../../packages/u-table'
export default {
  name: 'TableIndex',
  components: { UTable },
  data() {
    return {
      // 数据
      listData: [
        {
          id: 2,
          sku: 123123123,
          title: '标题',
          street_name: '哈哈哈',
          table_link: 'https://www.baidu.com',
          table_tags1: [
            {
              label: '失败', // tags的文案 必传
              type: 'danger' // tags的样式  不必传递 可选值（空/success/info/warning/danger）
            },
            {
              label: '成功',
              type: 'success'
            }
          ],
          table_tags2: [
            {
              label: '失败', // tags的文案 必传
              type: 'danger' // tags的样式  不必传递 可选值（空/success/info/warning/danger）
            }
          ],
          city_name: '2',
          description: '发生的及偶发活动四方红iOS的哈佛地盘上铺的撒粉红色DAU范德萨回放'
          // children:[
          //   {
          //     id:3,
          //     sku:123123123,
          //     title:'标题',
          //     street_name:'哈哈哈',
          //     table_link: 'https://www.baidu.com',
          //     table_tags1: [ // 固定字段
          //       {
          //         label:'失败', // tags的文案 必传
          //         type: 'danger' // tags的样式  不必传递 可选值（空/success/info/warning/danger）
          //       },
          //       {
          //         label: '成功',
          //         type: 'success'
          //       },
          //     ],
          //     table_tags2: [ // 固定字段
          //       {
          //         label:'失败', // tags的文案 必传
          //         type: 'danger' // tags的样式  不必传递 可选值（空/success/info/warning/danger）
          //       },
          //     ],
          //     city_name:'2',
          //     description: '发生的及偶发活动四方红iOS的哈佛地盘上铺的撒粉红色DAU范德萨回放',
          //   }
          // ]
        },
        {
          id: 1,
          sku: 12312345,
          title: '标题',
          street_name: '哈哈哈',
          table_link: 'https://www.baidu.com', // 固定字段
          table_tags1: [ // 固定字段
            {
              label: '失败', // tags的文案 必传
              type: 'danger' // tags的样式  不必传递 可选值（空/success/info/warning/danger）
            },
            {
              label: '成功',
              type: 'success'
            }
          ],
          table_tags2: [ // 固定字段
            {
              label: '失败', // tags的文案 必传
              type: 'danger' // tags的样式  不必传递 可选值（空/success/info/warning/danger）
            }
          ],
          city_name: '1',
          table_select1: [
            {
              label: '类型1',
              value: '1'
            },
            {
              label: '类型2',
              value: '2'
            }
          ]
        }
      ],
      // 控制的是每列，以及每列的格式
      columns: [
        {
          prop: 'id',
          label: 'ID',
          align: 'center',
          sortable: true
        },
        {
          type: 'link',
          prop: 'sku',
          label: 'SKU',
          link: 'table_link',
          align: 'center',
          filters: [{ // 过滤器
            text: '包含23',
            value: '23'
          }, { // 过滤器
            text: '包含45',
            value: '45'
          }],
          filtersMethod: (value, row) => {
            return String(row.sku).includes(value)
          }
        },
        {
          prop: 'title',
          label: '标题',
          align: 'center',
          scopedSlots: {
            customHeader: 'customHeader', // 自定义表头
            customRender: 'customRender' // 自定义渲染的 列表 和 render/format效果一致
          }
        },
        {
          type: 'edit', // 类型是行内编辑类型 并且是select编辑
          prop: 'city_name',
          label: '城市',
          align: 'center',
          selectData: { // 每一列选择的数据应该是一样的，所以放在这里，而不是listData 里面
            label: 'label', // 值 名称
            value: 'value', // 显示 名称
            list: [
              {
                label: '类型1',
                value: '1'
              },
              {
                label: '类型2',
                value: '2'
              }
            ]
          }
        },
        {
          type: 'edit', // 类型是行内编辑类型
          prop: 'street_name',
          label: '所在地',
          align: 'center'
        },
        {
          type: 'tags',
          prop: 'table_tags1', // tag的名称
          label: '状态1'
        },
        {
          type: 'tags',
          prop: 'table_tags2', // tag的名称
          label: '状态2'
        }
      ],
      options: {
        mutiSelect: false,
        rowKey: 'id', // 当前行的唯一id 当展开行和树形结构时，该属性是必填的
        loading: false,
        expendRowRender: true

      },
      operates: {
        label: '操作',
        list: [
          {
            id: '1',
            label: '编辑',
            type: 'text',
            show: true,
            inlineEdit: true
          },
          {
            id: '2',
            label: '设置权限',
            type: 'text',
            show: true,
            method: (index, row) => {
              this.handleSet(index, row)
            }
          }
        ]
      }
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    // todo 表格支持超链接
    // todo 表格支持行内编辑
    // todo 支持tags
    // todo 支持展开信息
    // todo 支持排序
    // todo 支持过滤器
    // todo 支持点击某个按钮 弹出弹窗
    // todo 宽度根据表头自适应
    // todo 自定义列
    // todo 可拖拽排序
    // onEdit(index, row){
    //   console.log(index)
    //   // 当行内编辑时
    //   // this.$refs.tableRef.editingIndex=index
    //   row.table_edit = true
    // },
    // 保存编辑
    confirmEdit({ row, successFun, errFun }) {
      console.log(row,successFun, errFun)
      // if (true) { // 请求接口成功
      //   successFun()
      // } else {
      //   errFun()
      // }
    },
    handleFilterSKU(value, row, column) {
      console.log(value, row, column)
    }
  }
}
</script>

<style scoped>

</style>
