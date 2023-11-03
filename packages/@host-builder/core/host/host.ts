import { Host, HostBuilderMiddleWare, HostBuilderMiddleWareContext, HostedService, ServiceFactoryOrFilePath, InitializingContext, InitializingAfterRunScriptContext } from "../interfaces";
import {Script} from 'node:vm'




const createMiddlewareContext = (): HostBuilderMiddleWareContext & {hostedServices: ServiceFactoryOrFilePath[], hooksMap: Map<string, ((ctx: any) => void)[]> } => {


    const hostedServices: ServiceFactoryOrFilePath[] = []
    const hooksMap: Map<string, ((ctx: any) => void)[]> = new Map()
    hooksMap.set("pre-vm", [])
    hooksMap.set("pre-start", [])
    hooksMap.set("post-start", [])
    hooksMap.set("pre-stop", [])
    hooksMap.set("post-stop", [])
    return {
        hostedServices,
        hooksMap,
        services: {
            register: (service): void => {
                hostedServices.push(service)
            } 
        },
        hooks: {
            preVmInitializedHook(cb) {
                const arr = hooksMap.get("pre-vm")
                arr?.push(cb)
            },
            preStartHook(cb) {
                const arr = hooksMap.get("pre-start")
                arr?.push(cb)
            },
            postStartHook(cb) {
                const arr = hooksMap.get("post-start")
                arr?.push(cb)
            },
            preStopHook(cb) {
                const arr = hooksMap.get("pre-stop")
                arr?.push(cb)
            },
            postStopHook(cb) {
                const arr = hooksMap.get("post-stop")
                arr?.push(cb)
            }
        }
    } 

}

export class HostImpl implements Host {

    private _services: HostedService[] = []

    private _initialized: boolean = false
    constructor(private middlewares: HostBuilderMiddleWare[]) {

    }

    async start(): Promise<void> {

        const ctx = createMiddlewareContext();
        for (const middleware of this.middlewares) {
            await middleware(ctx)
        }
        ctx.hostedServices.forEach(async serviceDef => {
            //@ts-ignore
            const source = typeof serviceDef === 'function' ? serviceDef.toString() : serviceDef;

            const script = new Script(source)
            const globalForScript = {...globalThis}
            ctx.hooksMap.get('pre-vm')?.forEach(h => h({service: source, sandboxContext: globalForScript}))
            const evalresultOrPromise = script.runInNewContext(globalForScript)(undefined) as HostedService | Promise<HostedService>
            let evalresult: HostedService;
            //@ts-ignore
            if(typeof evalresultOrPromise.then === 'function') {
                evalresult = await evalresultOrPromise
            }
            else {
                evalresult = evalresultOrPromise as HostedService
                
            }
                
            this._services.push(evalresult)
            ctx.hooksMap.get('pre-start')?.forEach(h => h({service: source, sandboxContext: globalForScript, evaledModule: evalresult}))
            await evalresult.start()
            ctx.hooksMap.get('post-start')?.forEach(h => h({service: source, sandboxContext: globalForScript, evaledModule: evalresult}))
            
        });

        //dirty hack
        this._initialized = true
        
    }
     stop(): Promise<void> {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if(this._initialized) {
                    clearInterval(interval)
                    this._services.forEach(async t => {
                        await t.stop()
                    })
                    resolve()
                }
            }, 10)
        })
       
         

    }

}

