import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { Handler } from 'express';
import * as BaseAdapter from 'ghost-storage-base'
import * as path from 'path'
import * as fs from 'fs'
import * as stream from 'stream'

export interface GhostStorageAdapterCachableS3Configuration {
    accessKeyId?: string
    secretAccessKey?: string
    sessionToken?: string
    bucketName: string
    pathPrefix: string

}

export class GhostStorageAdapterCachableS3 extends BaseAdapter {

    private readonly client: S3Client
    private readonly config: GhostStorageAdapterCachableS3Configuration
    private readonly endpointUrl: string

    constructor(config: GhostStorageAdapterCachableS3Configuration){
        super()

        // If we are given accessKeyId or secretAccessKey, we use them.
        // Optionally also the sessionToken may be supplied
        if(config.accessKeyId && config.secretAccessKey){
            this.client = new S3Client({
                credentials: {
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey,
                    sessionToken: config.sessionToken
                }
            })
        }else{
            // else we use the default provider chain which checks a whole
            // bunch of places for credentials
            this.client = new S3Client(fromNodeProviderChain())
        }

        this.config = config
        this.endpointUrl = `https://s3.amazonaws.com/${this.config.bucketName}`
    }

    private stripLeadingSlash(path: string): string {
        return path.indexOf('/') === 0 ? path.substring(1): path
    }

    private stripEndingSlash(path: string): string {
        return path.lastIndexOf('/') === path.length ? path.substring(0, path.length - 1) : path
    }

    public async exists(fileName: string, targetDir?: string | undefined): Promise<boolean> {
        try{
            const headObjectRequest = new HeadObjectCommand({
                Bucket: this.config.bucketName,
                Key: this.stripLeadingSlash(path.join(targetDir || this.config.pathPrefix , fileName))
            })
            const headObjectResponse = await this.client.send(headObjectRequest)
            return true
        }catch(error){
            return false
        }
        
    }


    public async save(image: BaseAdapter.Image, targetDir?: string | undefined): Promise<string> {
        const directory = targetDir || this.getTargetDir(this.config.pathPrefix)
        const uniqueFileName = this.getUniqueFileName(image, directory)
        const fileContent = await fs.promises.readFile(image.path)

        const putObjectRequest = new PutObjectCommand({
            Bucket: this.config.bucketName,
            Key: this.stripLeadingSlash(uniqueFileName),
            Body: fileContent
        })
        const putObjectResponse = await this.client.send(putObjectRequest)

        return `${this.endpointUrl}/${uniqueFileName}`

    }

    public serve(): Handler {
        return (handlerRequest, handlerResponse, handlerNext) => {
            handlerNext()
        }
        
    }
    public async delete(fileName: string, targetDir?: string | undefined): Promise<boolean> {

        try{
            const directory = targetDir || this.getTargetDir(this.config.pathPrefix)

            const deleteObjectRequest = new DeleteObjectCommand({
                Bucket: this.config.bucketName,
                Key: this.stripLeadingSlash(path.join(directory, fileName))
            })
    
            const deleteObjectResponse = await this.client.send(deleteObjectRequest)

            return true
        }catch(error){
            return false
        }
    }

    public async read(options?: BaseAdapter.ReadOptions | undefined): Promise<Buffer> {
        
        let path = (options?.path || '').replace(/\/$|\\$/, '')

        // check if path is stored in s3 handled by us
        if (!path.startsWith(this.endpointUrl)) {
            throw new Error(`${path} is not stored in s3`)
        }
        path = path.substring(this.endpointUrl.length)

        const getObjectRequest = new GetObjectCommand({
            Bucket: this.config.bucketName,
            Key: this.stripLeadingSlash(path)
        })
        const getObjectResponse = await this.client.send(getObjectRequest)
        const reader = getObjectResponse.Body!.transformToWebStream().getReader()

        const chunks:any[] = []
        while(true){
            const content = await reader.read()
            if(content.done){
                return Buffer.concat(chunks)
            }else{
                chunks.push(content?.value)
            }
        }
    }

}