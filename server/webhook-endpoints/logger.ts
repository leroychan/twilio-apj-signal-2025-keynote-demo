export class ServerlessLogger {
  constructor() {}

  debug = (ns: string, ...msg: any[]) => console.debug(ns, ...msg);
  error = (ns: string, ...msg: any[]) => console.error(ns, ...msg);
  info = (ns: string, ...msg: any[]) => console.info(ns, ...msg);
  warn = (ns: string, ...msg: any[]) => console.warn(ns, ...msg);
}
