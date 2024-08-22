import { getUserData$ } from "~/util/auth";

export function GET() {
  return getUserData$();
}
