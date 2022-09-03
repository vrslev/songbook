import Home from "@/views/Home.vue";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

export enum RouteNames {
  home = "Главная",
  notFound = "404",
  login = "Вход",
  addSong = "Новая песня",
  editSong = "Редактирование песни",
  song = "Песня",
  users = "Пользователи",
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: RouteNames.home,
    component: Home,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/not-found",
  },
  {
    path: "/not-found",
    name: RouteNames.notFound,
    component: () => import("./views/NotFound.vue"),
  },
  {
    path: "/login",
    name: RouteNames.login,
    component: () => import("./views/Login.vue"),
    meta: { hideFooter: true }, // TODO: Test hideFooter
  },
  {
    path: "/song/add",
    name: RouteNames.addSong,
    component: () => import("./views/SongAdd.vue"),
  },
  {
    path: "/song/:id/edit",
    name: RouteNames.editSong,
    component: () => import("./views/SongEdit.vue"),
    props: true,
  },
  {
    path: "/song/:id",
    name: RouteNames.song,
    component: () => import("./views/Song.vue"),
    props: true,
    meta: { noSetTitle: true },
  },
  {
    path: "/users",
    name: RouteNames.users,
    component: () => import("./views/Users.vue"),
  },
];

export const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // https://github.com/aryan02420/vue-router-save-scroll/tree/scroll-to-top
    // scroll to top if on same route
    if (to.name === from.name) {
      // @ts-ignore
      to.meta?.scrollPos && (to.meta.scrollPos.top = 0);
      return { left: 0, top: 0 };
    }
    const scrollPos = savedPosition ||
      to.meta?.scrollPos || { left: 0, top: 0 };
    return new Promise((resolve) => {
      // @ts-ignore
      resolve(scrollPos);
    });
  },
});

export const redirectToLogin = () =>
  router.push({
    name: RouteNames.login,
    query: { redirect: router.currentRoute.value.path },
  });

export const redirectToNotFound = () =>
  router.push({ name: RouteNames.notFound });

export const getHash = () => router.currentRoute.value.hash.slice(1);
export const updateHash = (value?: string) => {
  router.replace({ hash: value ? `#${value}` : undefined });
};
