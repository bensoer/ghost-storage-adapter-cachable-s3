import * as fs from 'fs'
import * as path from 'path'


export class FileCache {

    private readonly cacheDir: string

    constructor(cacheDir: string){
        this.cacheDir = cacheDir
    }

    public async has(filePath: string): Promise<boolean> {
        return fs.existsSync(path.join(this.cacheDir, filePath))
    }

    


}