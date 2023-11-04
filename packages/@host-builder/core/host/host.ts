import { Host, HostBuilderMiddleWare, HostBuilderMiddleWareContext, HostedService, ServiceFactoryOrFilePath, InitializingContext, InitializingAfterRunScriptContext, ServiceEvents, HostEvents } from "../interfaces";
import {Script} from 'node:vm'
import fs from 'node:fs'
import { EventEmitter } from "node:stream";
import TypedEventEmitter from "typed-emitter";
import { type } from "node:os";
import { createRequire } from "node:module";



type InternalHostBuilderMiddlewareContext = HostBuilderMiddleWareContext & {
    hostedServices: {
        service: ServiceFactoryOrFilePath;
        args: any[];
    }[];
};

const createMiddlewareContext = (): InternalHostBuilderMiddlewareContext => {


    const hostedServices: {service: ServiceFactoryOrFilePath, args: any[]}[] = []

    return {
        hostedServices,
        services: {
            register: (service, ...args): void => {
                hostedServices.push({service, args})
            } 
        },
        events: new EventEmitter() as TypedEventEmitter<ServiceEvents & HostEvents>
        }
} 



export class HostImpl implements Host {

    private _services: HostedService[] = []

    private _initialized: boolean = false
    private _ctx: InternalHostBuilderMiddlewareContext
    constructor(private middlewares: HostBuilderMiddleWare[]) {
        //@ts-ignore
        this._ctx = undefined;
    }

    async start(): Promise<void> {
        this._ctx = createMiddlewareContext()
        
        for (const middleware of this.middlewares) {
            await middleware(this._ctx)
        }
        this._ctx.events.emit('hostStarting', this)
        this._ctx.hostedServices.forEach(async serviceDef => {
            //@ts-ignore
            const isFunc = typeof serviceDef.service === 'function'
            const source = isFunc ? serviceDef.service.toString() : serviceDef.service

            const script = new Script(source as string)
            const req = createRequire(isFunc ? require.main?.filename as string : serviceDef.service.toString())
            const globalForScript = {...globalThis}
            globalForScript.require = req
            this._ctx.events.emit('preVmInit', {service: source, sandboxContext: globalForScript})
            const evalresultOrPromise = script.runInNewContext(globalForScript)(serviceDef.args) as HostedService | Promise<HostedService>
            let evalresult: HostedService;
            //@ts-ignore
            if(typeof evalresultOrPromise.then === 'function') {
                evalresult = await evalresultOrPromise
            }
            else {
                evalresult = evalresultOrPromise as HostedService

            }
                
            this._services.push(evalresult)
            this._ctx.events.emit('preStart',{service: source, sandboxContext: globalForScript, evaledModule: evalresult})
            await evalresult.start()
            this._ctx.events.emit('postStart',{service: source, sandboxContext: globalForScript, evaledModule: evalresult})
            
        });

        this._ctx.events.emit('hostStarted', this)
        //dirty hack
        this._initialized = true
        
    }
     stop(): Promise<void> {
        this._ctx.events.emit('hostStopping', this)

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if(this._initialized) {
                    clearInterval(interval)
                    this._services.forEach(async t => {
                        this._ctx.events.emit('preStop', {evaledModule: t})
                        await t.stop()
                        this._ctx.events.emit('postStop', {evaledModule: t})
                        const index = this._services.indexOf(t)
                        if(index !== 1) {
                            this._services.splice(index, 1)
                        }

                    })
                    const post = setInterval(() => {
                        if(this._services.length == 0) {
                            clearInterval(post)
                            this._ctx.events.emit('hostStopped', this)
                            //@ts-ignore
                            delete this._ctx
                        }
                    }, 20)
                }
            }, 10)
        })
       
         

    }

}