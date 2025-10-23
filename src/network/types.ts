import { RequesterInterface } from '~/network/interfaces.ts';

export type RequestCacheType =
  | "default"
  | "force-cache"
  | "no-cache"
  | "no-store"
  | "only-if-cached"
  | "reload";

export type RequestCredentialType = "include" | "omit" | "same-origin";

export type RequestModeType = "cors" | "navigate" | "no-cors" | "same-origin";

export type RequestRedirectType = "error" | "follow" | "manual";

export type ReferrerPolicyType =
  | ""
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "origin"
  | "origin-when-cross-origin"
  | "same-origin"
  | "strict-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";

export type RequestDestinationType =
  | ""
  | "audio"
  | "audioworklet"
  | "document"
  | "embed"
  | "font"
  | "image"
  | "manifest"
  | "object"
  | "paintworklet"
  | "report"
  | "script"
  | "sharedworker"
  | "style"
  | "track"
  | "video"
  | "worker"
  | "xslt";


export type ServerOptionsAddr = {
  transport: "tcp" | "udp" | "unix" | "unixpacket";
  hostname?: string;
  port?: number;
  path?: string;
  cid?: number;
}

export type ServerOptionsType = {
  name: string
  port?: number
  hostname?: string
  signal?: AbortSignal;
  onError?: (error: unknown) => Response | Promise<Response>;
  onListen?: (options: ServerOptionsAddr) => void;
}

export type HttpHandlerType = (request: RequesterInterface) => Promise<Response>
export type SocketHandlerType = (request: RequesterInterface, socket: WebSocket) => Promise<Response>

export default {}
