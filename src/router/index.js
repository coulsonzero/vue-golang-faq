import {createRouter, createWebHistory, createWebHashHistory} from "vue-router"
// import HomeView from '@/views/HomeView.vue'
// const HomeView = () => import('@/views/HomeView.vue')

const router = createRouter({
	mode: "history", //去掉url中的#
	// history: createWebHistory(import.meta.env.BASE_URL),
	history: createWebHashHistory("./"),
	routes: [
		// 重定向
		{
			path: '/',
			redirect: '/faq',
		},
		{
			path: "/about",
			name: "about",
			// which is lazy-loaded when the route is visited.
			component: () => import("@/views/AboutView.vue"),
		},
		{
			path: "/faq",
			name: "FAQ",
			component: () => import("@/views/FAQ.vue"),
		},
	],
})

export default router
