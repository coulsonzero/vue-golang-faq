import {createRouter, createWebHistory, createWebHashHistory} from "vue-router"
// import HomeView from '@/views/HomeView.vue'
// const HomeView = () => import('@/views/HomeView.vue')


const routes = [
	{
		path: "/",
		// 重定向
		redirect: "/faq",
	},
	{
		path: "/about",
		name: "about",
		// lazy-loaded
		component: () => import("@/views/AboutView.vue"),
	},
	{
		path: "/faq",
		name: "FAQ",
		component: () => import("@/views/FAQ.vue"),
	},
]

const router = createRouter({
	// mode: "history", //去掉url中的#
	// history: createWebHistory(import.meta.env.BASE_URL),
	history: createWebHashHistory(),
	routes,
})

export default router
