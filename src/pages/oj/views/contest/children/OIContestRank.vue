<template>
  <Panel shadow>
    <div slot="title">{{ contest.title }}</div>
    <div slot="extra">
      <screen-full :height="18" :width="18" class="screen-full"></screen-full>
      <Poptip trigger="hover" placement="left-start">
        <Icon type="android-settings" size="20"></Icon>
        <div slot="content" id="switches">
          <p>
            <span>{{$t('m.Menu')}}</span>
            <i-switch v-model="showMenu"></i-switch>
            <span>{{$t('m.Chart')}}</span>
            <i-switch v-model="showChart"></i-switch>
          </p>
          <p>
            <span>{{$t('m.Auto_Refresh')}}(10s)</span>
            <i-switch :disabled="refreshDisabled" @on-change="handleAutoRefresh"></i-switch>
          </p>
          <p v-if="isContestAdmin">
            <span>{{$t('m.RealName')}}</span>
            <i-switch v-model="showRealName"></i-switch>
          </p>
          <p>
            <Button type="primary" size="small" @click="downloadRankCSV">{{$t('m.download_csv')}}</Button>
          </p>
        </div>
      </Poptip>
    </div>
    <div v-show="showChart" class="echarts">
      <ECharts :options="options" ref="chart" auto-resize></ECharts>
    </div>
    <Table ref="tableRank" class="auto-resize" :columns="columns" :data="dataRank" disabled-hover></Table>
    <Pagination :total="total"
                :page-size.sync="limit"
                :current.sync="page"
                @on-change="getContestRankData"
                @on-page-size-change="getContestRankData(1)"
                show-sizer></Pagination>
  </Panel>
</template>
<script>
  import { mapActions } from 'vuex'

  import Pagination from '@oj/components/Pagination'
  import ContestRankMixin from './contestRankMixin'
  import utils from '@/utils/utils'

  export default {
    name: 'acm-contest-rank',
    components: {
      Pagination
    },
    mixins: [ContestRankMixin],
    data () {
      return {
        total: 0,
        page: 1,
        contestID: '',
        columns: [
          {
            align: 'center',
            width: 60,
            render: (h, params) => {
              return h('span', {}, params.index + (this.page - 1) * this.limit + 1)
            }
          },
          {
            title: this.$i18n.t('m.User_User'),
            align: 'center',
            render: (h, params) => {
              return h('a', {
                style: {
                  display: 'inline-block',
                  'max-width': '150px'
                },
                on: {
                  click: () => {
                    this.$router.push(
                      {
                        name: 'user-home',
                        query: { username: params.row.user.username }
                      })
                  }
                }
              }, params.row.user.username)
            }
          },
          {
            title: this.$i18n.t('m.Total_Score'),
            align: 'center',
            render: (h, params) => {
              return h('a', {
                on: {
                  click: () => {
                    this.$router.push({
                      name: 'contest-submission-list',
                      query: { username: params.row.user.username }
                    })
                  }
                }
              }, params.row.total_score)
            }
          },
          // modify the table fields (by wtf)
          {
            title: 'Runtime (ms)',
            align: 'center',
            render: (h, params) => {
              return h('a', {
                style: { color: '#57a3f3', cursor: 'pointer' },
                on: {
                  click: () => {
                    this.$router.push({
                      name: 'submission-details',
                      params: { id: params.row.submission_id }
                    })
                  }
                }
              }, params.row.runtime)
            }
          },
          {
            title: 'Memory (GB)',
            align: 'center',
            render: (h, params) => {
                return h('a', {
                  style: { color: '#57a3f3', cursor: 'pointer' },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: 'submission-details',
                        params: { id: params.row.submission_id }
                      })
                    }
                  }
                }, (params.row.memory / 1024 / 1024).toFixed(2))
            }
          }
        ],
        dataRank: [],
        // modify the chart options (by wtf)
        options: {
          title: {
            text: 'AI Contest Top 10',
            left: 'left'
          },
          legend: {
            data: ['Runtime', 'Memory'],
            top: 'top'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '10%',
            right: '10%',
            bottom: '10%',
            top: '20%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
          },
          yAxis: {
            type: 'category',
            data: []
          },
          series: [
            {
              name: 'Runtime',
              type: 'bar',
              data: [],
              label: {
                show: true,
                position: 'right',
                formatter: '{c} ms',
                color: '#000',
                fontSize: 12
              },
            }
          ]
        }
      }
    },
    mounted () {
      this.contestID = this.$route.params.contestID
      this.getContestRankData(1)
      if (this.contestProblems.length === 0) {
        this.getContestProblems().then((res) => {
          this.addTableColumns(res.data.data)
        })
      } else {
        this.addTableColumns(this.contestProblems)
      }
    },
    methods: {
      ...mapActions(['getContestProblems']),
      // modify the applyToChart function to fit the new chart  (by wtf)
      applyToChart(rankData) {
        const usernames = rankData.map(ele => ele.user.username)
        const runtimes = rankData.map(ele => ele.runtime)

        this.options.yAxis.data = usernames
        this.options.series[0].data = runtimes
      },
      applyToTable(data) {
        // deepcopy
        let dataRank = JSON.parse(JSON.stringify(data))
        // 从submission_info中取出相应的problem_id 放入到父object中,这么做主要是为了适应iview table的data格式
        // 见https://www.iviewui.com/components/table
        dataRank.forEach((rank, i) => {
          let info = rank.submission_info
          Object.keys(info).forEach(problemID => {
            dataRank[i][problemID] = info[problemID]
          })
          // add runtime and memory to the parent object (by wtf)
          dataRank[i].runtime = rank.runtime
          dataRank[i].memory = rank.memory
        })
        this.dataRank = dataRank
      },
      addTableColumns (problems) {
        problems.forEach(problem => {
          this.columns.push({
            align: 'center',
            key: problem.id,
            renderHeader: (h, params) => {
              return h('a', {
                'class': {
                  'emphasis': true
                },
                on: {
                  click: () => {
                    this.$router.push({
                      name: 'contest-problem-details',
                      params: {
                        contestID: this.contestID,
                        problemID: problem._id
                      }
                    })
                  }
                }
              }, problem._id)
            },
            render: (h, params) => {
              return h('span', params.row[problem.id])
            }
          })
        })
      },
      downloadRankCSV () {
        utils.downloadFile(`contest_rank?download_csv=1&contest_id=${this.$route.params.contestID}&force_refrash=${this.forceUpdate ? '1' : '0'}`)
      }
    }
  }
</script>
<style scoped lang="less">
  .echarts {
    margin: 20px auto;
    height: 400px;
    width: 98%;
  }

  .screen-full {
    margin-right: 8px;
  }

  #switches {
    p {
      margin-top: 5px;
      &:first-child {
        margin-top: 0;
      }
      span {
        margin-left: 8px;
      }
    }
  }
</style>
