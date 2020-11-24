<!--region 封装的分页 table-->
<template>
  <div class="table">
    <!-- <table-setting  :columns="columns"></table-setting> -->
    <el-table
      id="iTable"
      ref="mutipleTable"
      v-loading.iTable="options.loading"
      :data="data"
      :stripe="options.stripe"
      :row-key="options.rowKey?options.rowKey:''"
      :border="options.border"
      :max-height="options.maxHeight || 500"
      @selection-change="handleSelectionChange"
    >
      <!-- 自定义空内容 -->
      <template v-if="options.emptySlot" slot="empty">
        <slot :name="options.emptySlot" />
      </template>
      <!--region 选择框-->
      <el-table-column
        v-if="options.mutiSelect"
        type="selection"
        fixed="left"
        :reserve-selection="true"
        style="width: 55px;"
      />
      <!--endregion-->
      <!--region 数据列-->
      <!-- :sortable="index===0?true:false" -->
      <el-table-column v-if="options.expendRowRender" type="expand">
        <template slot-scope="scope">
          <!-- 展开的行的数据插槽 -->
          <slot name="expendRowRender" :row="scope.row" />
        </template>
      </el-table-column>
      <template v-for="(column, index) in columns">
        <el-table-column
          v-if="column.show!==false"
          :key="column.label"
          :prop="column.prop"
          :label="column.label"
          :align="column.align || 'center'"
          :min-width="fitColumnWidth(column.label,index)"
          :width="column.width"
          :sortable="column.sortable?column.sortable:false"
          :filters="column.filters"
          :filter-method="column.filtersMethod"
          :fixed="column.fixed"
        >
          <!-- 自定义表头 -->
          <!--  slot="header" slot-scope="scope" -->
          <template v-slot:header>
            <slot v-if="column.scopedSlots && column.scopedSlots.customHeader" :name="column.scopedSlots.customHeader" :column="column" />
            <template v-else>
              {{ column.label }}
            </template>
          </template>

          <!-- 自定义下方内容 -->
          <template slot-scope="scope">
            <!-- element内的元素需要用到render -->
            <template v-if="column.render">
              <expand-dom
                :column="column"
                :row="scope.row"
                :render="column.render"
                :index="index"
              />
            </template>
            <!-- 自定义列的插槽 -->
            <template v-if="column.scopedSlots && column.scopedSlots.customRender">
              <slot :name="column.scopedSlots.customRender" :row="scope.row" :column="column" />
            </template>
            <template v-else>
              <!-- 普通的html formatter -->
              <template v-if="column.formatter">
                <span v-html="column.formatter(scope.row, column)" />
              </template>
              <!-- 链接 -->
              <template v-else-if="column.type==='link' && scope.row[column.link]">
                <el-link type="primary" :href="scope.row[column.link]" :underline="false" target="_blank">{{ scope.row[column.prop] }}</el-link>
              </template>
              <!-- tags -->
              <template v-else-if="column.type==='tags' && scope.row[column.prop].length">
                <el-tag
                  v-for="item in scope.row[column.prop]"
                  :key="item.label"
                  :type="item.type"
                  :effect="item.effect || 'light'"
                  size="mini"
                  style="margin: 2px;"
                >
                  {{ item.label }}
                </el-tag>
              </template>
              <!-- edit -->
              <template v-else-if="column.type==='edit' && !column.scopedSlots">
                <!-- 选择 -->
                <template v-if="column.selectData">
                  <el-select v-if="scope.row['table_edit']" v-model="scope.row[column.prop]" placeholder="请选择">
                    <el-option
                      v-for="item in column.selectData.list"
                      :key="item[column.selectData.value]"
                      :label="item[column.selectData.label]"
                      :value="item[column.selectData.value]"
                    />
                  </el-select>
                  <span v-else>{{ scope.row[column.prop] }}</span>
                  <!-- <span v-else>{{ getMatchObj(column.selectData.list,column.selectData.value,scope.row[column.prop])[column.selectData.label] }}</span> -->
                </template>
                <!-- 日期选择 -->
                <template v-else-if="column.datePicker">
                  <el-date-picker v-if="scope.row['table_edit']" v-model="scope.row[column.prop]" type="date" placeholder="请选择" style="width: 100%;" value-format="yyyy-MM-dd" />
                  <span v-else>{{ scope.row[column.prop] }}</span>
                </template>
                <!-- input 类型 -->
                <template v-else>
                  <el-input v-if="scope.row['table_edit']" v-model="scope.row[column.prop]" class="edit-input" />
                  <span v-else>{{ scope.row[column.prop] }}</span>
                </template>

              </template>
              <template v-else>
                <span>{{ scope.row[column.prop] || scope.row[column.prop]===0 ? scope.row[column.prop]: '-' }}</span>
              </template>
            </template>

          </template>
        </el-table-column>
      </template>
      <!--endregion-->
      <!--region 按钮操作组-->
      <template v-if="operates">
        <el-table-column
          v-if="operates.list && operates.list.filter(_x => _x.show === true).length > 0"
          ref="fixedColumn"
          label="操作"
          align="center"
          :width="operates.width"
          :fixed="operates.fixed"
        >
          <template slot-scope="scope">
            <div class="operate-group">
              <template v-for="(btn, key) in operates.list">
                <!-- <div class="item"  > -->
                <template v-if="btn.show">
                  <!-- 如果是行内编辑 -->
                  <template v-if="btn.inlineEdit">
                    <!-- 状态编辑中 -->
                    <template v-if="scope.row['table_edit']">
                      <el-button
                        :key="btn.label+Math.random(1000)"
                        :type="btn.type"
                        size="mini"
                        :icon="btn.icon"
                        :disabled="btn.disabled || false"
                        :loading="editLoading"
                        @click="confirmEdit(key, scope.row)"
                      >
                        {{ '保存' }}
                      </el-button>
                      <el-button
                        :key="btn.label+Math.random(1000)"
                        :type="btn.type"
                        size="mini"
                        :icon="btn.icon"
                        :disabled="btn.disabled || false"
                        :plain="btn.plain"
                        :loading="editLoading"
                        @click="cancelEdit(scope.row)"
                      >{{ '取消' }}
                      </el-button>
                    </template>
                    <!-- 状态 未编辑 -->
                    <!-- :disabled="isEditing" -->
                    <el-button
                      v-else
                      :key="btn.label+Math.random(1000)"
                      :type="btn.type"
                      size="mini"
                      :icon="btn.icon"
                      :disabled="btn.disabled || false"
                      :plain="btn.plain"
                      @click="onEdit(key, scope.row)"
                    >{{ btn.label }}
                    </el-button>
                  </template>
                  <!-- 普通的 -->
                  <el-button
                    v-else
                    :key="btn.id"
                    :type="btn.type"
                    size="mini"
                    :icon="btn.icon"
                    :disabled="btn.disabled || false"
                    :plain="btn.plain"
                    @click.native.prevent="btn.method(key, scope.row)"
                  >{{ btn.label }}
                  </el-button>
                </template>

                <!-- </div> -->
              </template>
            </div>
          </template>
        </el-table-column>
      </template>

      <!--endregion-->
    </el-table>

    <!-- limit:每页显示  page:当前页 -->
    <!-- <pagination :total="400" :page.sync="parmas.page" :limit.sync="parmas.page_size" @pagination="getList" /> -->
    <!-- <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage4"
      :page-sizes="[100, 200, 300, 400]"
      :page-size="100"
      layout="total, sizes, prev, pager, next, jumper"
      :total="400">
    </el-pagination> -->
  </div>
</template>
<!--endregion-->
<script>

export default {
  name: 'UTable',
  components: {
    expandDom: {
      functional: true,
      props: {
        row: Object,
        render: Function,
        index: Number,
        column: {
          type: Object,
          default: null
        }
      },
      render: (h, ctx) => {
        const params = {
          row: ctx.props.row,
          index: ctx.props.index
        }
        if (ctx.props.column) params.column = ctx.props.column
        return ctx.props.render(h, params)
      }
    }
  },
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 表头数据 需要展示的列
    /**
     * type: 当前列的类型
     * prop：列数据对应的字段名
     * label：列名
     * align：对齐方式 默认居中
     * width：列宽 默认 表头的宽度
     * sortable: 是否排序 默认 false
     *
     *
    */
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 操作按钮组 === label: 文本，type :类型（primary / success / warning / danger / info / text），show：是否显示，icon：按钮图标，plain：是否朴素按钮，disabled：是否禁用，method：回调方法 inlineEdit: 是否是行内编辑
    operates: {
      type: Object,
      default: () => {
        return {
          width: 'auto',
          type: 'text',
          plain: false,
          fixed: false,
          list: []
        }
      }
    },

    /**
     *
     * table 表格的控制参数
     * mutiSelect  是否多选
     * rowKey: 行数据的row-key
     * border: 是否显示表格竖线
     * expendRowRender: 是否展开行
     * emptySlot: 自定义空状态的插槽
     * maxHeight: 流体高度
    */
    options: {
      type: Object,
      default: () => {
        return {
          stripe: false, // 是否为斑马纹 table
          // loading: true, // 是否添加表格loading加载动画
          // highlightCurrentRow: false, // 是否支持当前行高亮显示
          mutiSelect: false, // 是否支持列表项选中功能
          border: false, // 是否显示表格竖线
          expendRowRender: false // 是否展开行
        }
      }
    }
    // 当有type ===edit时候  confirmEdit方法必须传递（前端做的事情）
  },
  // 数据
  data() {
    return {
      pageIndex: 1,
      multipleSelection: [], // 多行选中
      currentPage4: 4,
      isEditing: false, // 控制操作按钮
      editableArr: [], // 可编辑列表的字段名
      editLoading: false
      // dataList:[]
    }
  },
  computed: {

  },
  watch: {
    // data:{
    //   handler(newValue,oldValue){
    //     if(newValue !== oldValue){
    //       this.dataList = this.data
    //     }
    //   },
    // }
  },
  created() {
  },
  mounted() {
    this.getInit()
  },
  methods: {
    getMatchObj(arrObj, searchkey, value) {
      var arr = arrObj
      for (var i = 0; i < arrObj.length; i++) {
        if (arr[i][searchkey] == value) {
          return arr[i]
        }
      }
      return false
    },
    // 多行选中
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.$emit('handleSelectionChange', val)
    },
    // 显示 表格操作弹窗
    showActionTableDialog() {
      this.$emit('handelAction')
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },
    fitColumnWidth(tableHead) {
      // 根据表头自适应列宽
      let flexWidth = 0
      for (const char of tableHead) {
        if ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')) {
          // 如果是英文字符，为字符分配8个单位宽度
          flexWidth += 9
        } else if (char >= '\u4e00' && char <= '\u9fa5') {
          // 如果是中文字符，为字符分配15个单位宽度
          flexWidth += 18
        } else {
          // 其他种类字符，为字符分配8个单位宽度
          flexWidth += 8
        }
        // if(index===0){
        //   flexWidth += 8
        // }
      }
      flexWidth += 10 // 加上padding值

      if (flexWidth < 60) {
        // 设置最小宽度
        flexWidth = 60
      }
      // if (flexWidth > 250) {
      //   // 设置最大宽度
      //   flexWidth = 250
      // }
      return flexWidth + 'px'
    },

    getInit() {
      this.columns.map(v => {
        if (v.type === 'edit') {
          this.editableArr.push(v.prop)
        }
      })
    },
    // 行内编辑
    onEdit(index, row) {
      this.isEditing = true
      this.$set(row, 'table_edit', true)
      // row.table_edit = true // 控制当前行
      this.editableArr.map(v => {
        row['origin-' + v] = row[v]
      })
    },
    // 保存编辑
    confirmEdit(index, row) {
      // this.isEditing = false
      // row.table_edit = false;
      // 删掉不必要的元素
      // this.editableArr.map(v=>{
      //   delete row['origin-'+v]
      // })
      // delete row.table_edit
      this.editLoading = true
      this.$emit('confirmEdit', {
        row: row,
        successFun: () => {
          this.editLoading = false
          this.isEditing = false
          row.table_edit = false
        },
        errFun: () => {
          this.editLoading = false
          this.editableArr.map(v => {
            row[v] = row['origin-' + v]
          })
        }
      })
    },
    // 取消编辑
    cancelEdit(row) {
      this.isEditing = false
      row.table_edit = false
      this.editableArr.map(v => {
        row[v] = row['origin-' + v]
      })
      // row.title = row.originalTitle
    }
  }
}
</script>
<style>
  /* .el-pagination{
    text-align: center;
    margin-top: 20px;
  } */
</style>
