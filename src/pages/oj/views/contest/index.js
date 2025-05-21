const ContestList = () => import(/* webpackChunkName: "contest" */ './ContestList.vue')
const ContestDetails = () => import(/* webpackChunkName: "contest" */ './ContestDetail.vue')
const ContestSubmissionDetails = () => import(/* webpackChunkName: "contest" */ './children/ContestSubmissionDetails.vue')
const ContestSubmissionList = () => import(/* webpackChunkName: "contest" */ './children/ContestSubmissionList.vue')
const ContestProblem = () => import(/* webpackChunkName: "contest" */ './children/ContestProblem.vue')
const ContestProblemList = () => import(/* webpackChunkName: "contest" */ './children/ContestProblemList.vue')
const ContestRank = () => import(/* webpackChunkName: "contest" */ './children/ContestRank.vue')
const ACMContestHelper = () => import(/* webpackChunkName: "contest" */ './children/ACMHelper.vue')

export {
    ContestDetails,
    ContestList,
    ContestSubmissionDetails,
    ContestSubmissionList,
    ContestProblem,
    ContestProblemList,
    ContestRank,
    ACMContestHelper
}
