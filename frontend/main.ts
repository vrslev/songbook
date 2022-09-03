import * as Sentry from "@sentry/vue";
import { setLocale } from "yup";
import App from "./App.vue";
import { Client } from "./client";
import { authKey, songKey, userKey } from "./dependencies";
import { yupRu } from "./i18n";
import "./main.css";
import { router } from "./router";
import { getAuthAPI, getAuthService, token } from "./services/auth";
import { getSongAPI, getSongService } from "./services/song";
import { getUserAPI, getUserService } from "./services/user";

const BASE = import.meta.env.DEV ? "http://127.0.0.1:8000" : "/api";

const client = new Client({ BASE });

const authClient = computed(() => {
  if (!token.value) throw new Error("No token provided");
  return new Client({ BASE, TOKEN: token.value });
});

setLocale(yupRu);

const app = createApp(App);

Sentry.init({ app, dsn: import.meta.env.VITE_SENTRY_DSN });

app.provide(authKey, getAuthService(getAuthAPI(client, authClient)));
app.provide(songKey, getSongService(getSongAPI(client, authClient)));
app.provide(userKey, getUserService(getUserAPI(authClient)));

app.use(router);

app.mount("#app");
