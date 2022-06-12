import path from 'path';
import { Channel } from "generated"
import { VendureSyncConfig } from "./config.interface"

export const configForChannel = (config: VendureSyncConfig, channel: Channel) => {
    return { ...config, 
        headers: {...config.headers, "vendure-token": channel.token},
        sourceDir: path.join(config.sourceDir, channel.code)
    }
}