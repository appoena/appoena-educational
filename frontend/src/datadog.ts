import { datadogRum } from '@datadog/browser-rum';
import type { RumInitConfiguration } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

let rumEnabled = false;
type SimpleRumContext = Record<string, string | number | boolean | null>;

export function initDatadogRum() {
  const applicationId = import.meta.env.VITE_DD_APPLICATION_ID;
  const clientToken = import.meta.env.VITE_DD_CLIENT_TOKEN;

  if (!applicationId || !clientToken) {
    console.info(
      "[Tea Shop Demo] Datadog RUM disabled. Set VITE_DD_APPLICATION_ID and VITE_DD_CLIENT_TOKEN to enable it."
    );
    return false;
  }

  const site = (import.meta.env.VITE_DD_SITE || "datadoghq.com") as RumInitConfiguration["site"];

  datadogRum.init({
    applicationId,
    clientToken,
    site,
    service: import.meta.env.VITE_DD_SERVICE || "tea-shop-demo",
    env: import.meta.env.VITE_DD_ENV || "local",
    version: import.meta.env.VITE_DD_VERSION || "1.0.0",
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    trackViewsManually: true,
    defaultPrivacyLevel: "mask-user-input",
    allowedTracingUrls: [/http:\/\/localhost*/, /http:\/\/frontend*/],
    plugins: [reactPlugin({ router: false })]
  });

  rumEnabled = true;
  console.info("[Tea Shop Demo] Datadog RUM enabled.");
  return true;
}

export function isRumEnabled() {
  return rumEnabled;
}

export function startRumView(name: string, context: Record<string, unknown> = {}) {
  if (!rumEnabled) {
    return;
  }

  datadogRum.startView({
    name,
    context: cleanContext(context)
  });
}

export function setDemoRumUser(user: {
  id: string;
  name: string;
  email: string;
  journey?: string;
}) {
  if (!rumEnabled) {
    return;
  }

  datadogRum.setUser({
    id: user.id,
    name: user.name,
    email: user.email,
    type: "synthetic-demo",
    journey: user.journey || "manual"
  } as Parameters<typeof datadogRum.setUser>[0]);

  datadogRum.addAction("synthetic_user_started", {
    userId: user.id,
    journey: user.journey || "manual"
  });
}

export function addRumAction(name: string, context: Record<string, unknown> = {}) {
  if (!rumEnabled) {
    return;
  }

  datadogRum.addAction(name, cleanContext(context));
}

export function captureRumError(error: unknown, context: Record<string, unknown> = {}) {
  if (!rumEnabled) {
    return;
  }

  const normalizedError = error instanceof Error ? error : new Error(String(error));
  datadogRum.addError(normalizedError, cleanContext(context));
}

function cleanContext(context: Record<string, unknown>): SimpleRumContext {
  return Object.fromEntries(
    Object.entries(context).filter((entry): entry is [string, string | number | boolean | null] => {
      const value = entry[1];
      return value === null || ["string", "number", "boolean"].includes(typeof value);
    })
  );
}
