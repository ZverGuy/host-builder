import { start } from "repl";
import { HostBuilderMiddleWare, HostedService, ServiceFactoryOrFilePath } from "../interfaces";
import { readFileSync } from "fs";

export const currentThreadWorker = (worker: ServiceFactoryOrFilePath, initialData: any[]): HostBuilderMiddleWare => {


    const isFunction = typeof worker === 'function'
    const source = isFunction ? worker.toString() : worker

    return (ctx) => {
            ctx.services.register(source, initialData)
        }

}