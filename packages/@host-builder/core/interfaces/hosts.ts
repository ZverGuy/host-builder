import { HostBuilderMiddleWare } from "./middleware"

export interface HostBuilder {
    

    use(...middlewares: HostBuilderMiddleWare[]): HostBuilder


    build(): Host
}
export interface Host {

    start(): Promise<void>
    stop(): Promise<void>


}

export interface HostedService {
    start(): Promise<void>
    stop(): Promise<void>
    
}


