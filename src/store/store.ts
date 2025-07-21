import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./authApi";
import { tasksApi } from "./tasksApi";
import { templatesApi } from "./templatesApi";
import { workflowsApi } from "./workflowsApi";
import { analyticsApi } from "./analyticsApi";
import { settingsApi } from "./settingsApi";
import { notificationsApi } from "./notificationsApi";
import { aiOptimizerApi } from "./aiOptimizerApi";
import { integrationsApi } from "./integrationsApi";
import { securityApi } from "./securityApi";
import { oauthApi } from "./oauthApi";
import authSlice from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [templatesApi.reducerPath]: templatesApi.reducer,
    [workflowsApi.reducerPath]: workflowsApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [aiOptimizerApi.reducerPath]: aiOptimizerApi.reducer,
    [integrationsApi.reducerPath]: integrationsApi.reducer,
    [securityApi.reducerPath]: securityApi.reducer,
    [oauthApi.reducerPath]: oauthApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      tasksApi.middleware,
      templatesApi.middleware,
      workflowsApi.middleware,
      analyticsApi.middleware,
      settingsApi.middleware,
      notificationsApi.middleware,
      aiOptimizerApi.middleware,
      integrationsApi.middleware,
      securityApi.middleware,
      oauthApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
