import {createRouter, createWebHistory, createWebHashHistory} from "vue-router"
// import HomeView from '@/views/HomeView.vue'
const HomeView = () => import('@/views/HomeView.vue')

const router = createRouter({
	mode: "history", //去掉url中的#
	// history: createWebHistory(import.meta.env.BASE_URL),
	history: createWebHashHistory("./"),
	routes: [
		// {
		// 	path: "/",
		// 	name: "home",
		// 	component: HomeView,
		// },
		{
			path: "/about",
			name: "about",
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import("@/views/AboutView.vue"),
		},
		{
			path: "/",
			name: "FAQ",
			component: () => import("@/views/FAQ.vue"),
		},
	],
})

export default router
