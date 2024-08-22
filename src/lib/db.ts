// yoinked from nitro, should not be needed, howevcer #internal/nitro does not resolve from node_modules for some reason
/* eslint-disable */
// @ts-ignore
import { connectionConfigs } from "#nitro-internal-virtual/database";
import type { Database } from "db0";
import { createDatabase } from "db0";

const instances: Record<string, Database> = Object.create(null);

export function useDatabase(name = "default"): Database {
  if (instances[name]) {
    return instances[name];
  }
  if (!connectionConfigs[name]) {
    throw new Error(`Database connection "${name}" not configured.`);
  }
  return (instances[name] = createDatabase(connectionConfigs[name].connector(connectionConfigs[name].options || {})));
}
