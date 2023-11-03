import { HostBuilderMiddleWare } from "./middleware"

export interface HostBuilder {
    

    use(...middlewares: HostBuilderMiddleWare[]): HostBuilder


    build(): Host
}
export interface Host {

    start(): Promise<void>
    stop(): Promise<void>


}

export type HostEvents = {
    hostStarting: (host: Host) => void
    hostStarted: (host: Host) => void
    hostStopping: (host: Host) => void
    hostStopped: (host: Host) => void
}

export interface HostedService {
    start(): Promise<void>
    stop(): Promise<void>
    
}


