import type * as endpoints from "./codegen/sdk.gen";

export type ApiCallMethod = (typeof endpoints)[keyof typeof endpoints];
