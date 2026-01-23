import type { S3ListObjectsResponse } from 'bun'

export interface ListBucketObjectsParams {
  bucket: string // Bucket name (not the bucket id)
  prefix?: string // Optional key prefix
}

// TODO: reconfigure the output schema
export interface ListBucketObjectsResponse extends S3ListObjectsResponse {}

export interface UploadFileParams {
  bucket: string // Bucket name (not the bucket id)
  overwrite?: boolean // Overwrite existing object
}

export interface UploadFileRequest {
  file: File | Blob | FormData
}

export interface UploadFileResponse {}

export interface CreateFolderParams {
  bucket: string // Bucket name (not the bucket id)
  prefix?: string // Optional key prefix
}

export interface CreateFolderRequest {
  name: string // Folder name
}

export interface CreateFolderResponse {}
