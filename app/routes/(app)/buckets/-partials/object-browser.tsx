import { useSuspenseQuery, useMutation, QueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button } from '~/app/components/button'
import { Checkbox } from '~/app/components/checkbox'
import { IconBox } from '~/app/components/icon-box'
import { InputGroup, InputGroupAddon } from '~/app/components/input-group'
import { Menu, MenuPopup, MenuItem, MenuTrigger, MenuSeparator } from '~/app/components/menu'
import { Spinner } from '~/app/components/spinner'
import { Stack } from '~/app/components/stack'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '~/app/components/table'
import { Text, TextLink } from '~/app/components/typography'
import objectsService from '~/app/services/objects.service'
import { clx } from '~/app/utils'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'
import { CreateFolderDialog } from './create-folder-dialog'
import { UploadFileDialog } from './upload-file-dialog'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  modified: string
}

interface ObjectBrowserProps {
  queryClient: QueryClient
  bucket: GetBucketInfoResponse
  prefix?: string | null
  key?: string | null
  bucketId: string
  isRefreshing?: boolean
}

export function ObjectBrowser({
  queryClient,
  bucket,
  prefix,
  key,
  bucketId,
  isRefreshing
}: ObjectBrowserProps) {
  const bucketParam =
    bucket.globalAliases && bucket.globalAliases.length > 0 && bucket.globalAliases[0]
      ? bucket.globalAliases[0]
      : bucket.id

  const hasAccessKeys = bucket.keys && bucket.keys.length > 0

  const objectsQuery = useSuspenseQuery({
    queryKey: ['objects', bucket.id, prefix, key],
    queryFn: async () => {
      if (!hasAccessKeys) {
        return { data: { commonPrefixes: [], contents: [] } }
      }
      return objectsService.listBucketObjects({ bucket: bucketParam, prefix: prefix || undefined })
    }
  })

  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      return objectsService.createFolder(
        { bucket: bucketParam, prefix: prefix || undefined },
        { name: folderName }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects', bucket.id, prefix, key] })
    },
    onError: (error) => {
      console.error('Failed to create folder:', error)
    }
  })

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      return objectsService.uploadFile({ bucket: bucketParam }, { file })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects', bucket.id, prefix, key] })
    },
    onError: (error) => {
      console.error('Failed to upload file:', error)
    }
  })

  const [filterText, setFilterText] = React.useState('')
  const [showCreateFolderDialog, setShowCreateFolderDialog] = React.useState(false)
  const [showUploadFileDialog, setShowUploadFileDialog] = React.useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false)
  const [isUploadingFile, setIsUploadingFile] = React.useState(false)
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set())

  const fileItems: FileItem[] = React.useMemo(() => {
    const commonPrefixes = objectsQuery.data?.data?.commonPrefixes || []
    const contents = objectsQuery.data?.data?.contents || []

    const folderItemsFromPrefixes = commonPrefixes
      .filter((folder: any) => folder.prefix !== prefix)
      .map((folder: any) => ({
        id: folder.prefix,
        name: folder.prefix.replace(/\/$/, '').replace(prefix || '', ''),
        type: 'folder' as const,
        size: 0,
        modified: new Date().toISOString()
      }))

    const emptyFolders = contents
      .filter((obj: any) => obj.key.endsWith('/') && obj.key !== prefix)
      .map((obj: any) => ({
        id: obj.key,
        name: obj.key.replace(/\/$/, '').replace(prefix || '', ''),
        type: 'folder' as const,
        size: 0,
        modified: obj.lastModified || new Date().toISOString()
      }))

    const fileItems = contents
      .filter((obj: any) => !obj.key.endsWith('/'))
      .map((obj: any) => ({
        id: obj.key,
        name: obj.key.replace(prefix || '', ''),
        type: 'file' as const,
        size: obj.size,
        modified: obj.lastModified
      }))

    return [...folderItemsFromPrefixes, ...emptyFolders, ...fileItems]
  }, [objectsQuery.data, prefix])

  const filteredFiles = React.useMemo(() => {
    if (!filterText) return fileItems
    const lowerFilter = filterText.toLowerCase()
    return fileItems.filter((file) => file.name.toLowerCase().includes(lowerFilter))
  }, [filterText, fileItems])

  const folders = filteredFiles.filter((file) => file.type === 'folder')
  const files = filteredFiles.filter((file) => file.type === 'file')

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopyUrl = (item: FileItem) => {
    console.log('Copy URL', item)
  }

  const handleRename = (item: FileItem) => {
    console.log('Rename', item)
  }

  const handleDownload = (item: FileItem) => {
    console.log('Download', item)
  }

  const handleDelete = (item: FileItem) => {
    console.log('Delete', item)
  }

  const handleBatchDownload = () => {
    const selectedItemsList = Array.from(selectedItems)
    console.log('Batch download', selectedItemsList)
  }

  const handleBatchDelete = () => {
    const selectedItemsList = Array.from(selectedItems)
    console.log('Batch delete', selectedItemsList)
  }

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const allItemIds = [...folders.map((f) => f.id), ...files.map((f) => f.id)]
    if (selectedItems.size === allItemIds.length && allItemIds.length > 0) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(allItemIds))
    }
  }

  const handleCreateFolder = async (folderName: string) => {
    setIsCreatingFolder(true)
    try {
      await createFolderMutation.mutateAsync(folderName)
      setShowCreateFolderDialog(false)
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleUploadFiles = async (files: File[]) => {
    setIsUploadingFile(true)
    try {
      for (const file of files) {
        await uploadFileMutation.mutateAsync(file)
      }
      setShowUploadFileDialog(false)
    } catch (error) {
      console.error('Failed to upload files:', error)
    } finally {
      setIsUploadingFile(false)
    }
  }

  const breadcrumbSegments = React.useMemo(() => {
    if (!prefix) return []
    const segments = prefix.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      name: segment,
      path: segments.slice(0, index + 1).join('/') + '/'
    }))
  }, [prefix])

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <InputGroup className='min-w-64 flex-1'>
          <InputGroupAddon align='start'>
            <Lucide.Search className='text-muted-foreground size-4' />
          </InputGroupAddon>
          <input
            type='text'
            placeholder='Search files and folders...'
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className='h-9 bg-transparent py-2 pr-4 pl-2 outline-none'
          />
          {filterText && (
            <InputGroupAddon align='end'>
              <Button
                type='button'
                variant='plain'
                size='xs-icon'
                onClick={() => setFilterText('')}
              >
                <Lucide.X className='size-4' />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>

        <Stack direction='row'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setShowCreateFolderDialog(true)}
            disabled={!hasAccessKeys}
          >
            <Lucide.FolderPlus className='size-4' />
            Create Folder
          </Button>
          <Button
            type='button'
            variant='primary'
            onClick={() => setShowUploadFileDialog(true)}
            disabled={!hasAccessKeys}
          >
            <Lucide.Upload className='size-4' />
            Upload File
          </Button>
        </Stack>
      </div>

      <div className='border-border flex items-center gap-2 rounded-md border px-2 py-1.5'>
        <Link
          to='/buckets/$id'
          params={{ id: bucketId }}
          search={{ prefix: undefined, key: undefined }}
        >
          <Button variant='plain' size='sm'>
            <Lucide.Home className='size-4' />
          </Button>
        </Link>
        {breadcrumbSegments.length > 0 && (
          <>
            {breadcrumbSegments.map((segment, index) => (
              <React.Fragment key={segment.path}>
                <Lucide.ChevronRight className='text-muted-foreground size-4' />
                <Link
                  to='/buckets/$id'
                  params={{ id: bucketId }}
                  search={{ prefix: segment.path, key: undefined }}
                >
                  <Button variant='plain' size='sm'>
                    <TextLink
                      className={index === breadcrumbSegments.length - 1 ? 'font-semibold' : ''}
                    >
                      {segment.name}
                    </TextLink>
                  </Button>
                </Link>
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {selectedItems.size > 0 && (
        <div className='border-border bg-dimmed/10 flex items-center justify-between gap-3 rounded-lg border py-2.5 pr-4 pl-5'>
          <div className='flex items-center gap-3'>
            <Checkbox
              checked={
                filteredFiles.length > 0 &&
                selectedItems.size ===
                  [...folders.map((f) => f.id), ...files.map((f) => f.id)].length
              }
              onClick={handleSelectAll}
            />
            <Text className='text-sm font-medium'>
              {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
            </Text>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='tertiary' size='xs' onClick={handleBatchDownload}>
              <Lucide.Download className='size-3' />
              Download
            </Button>
            <Button variant='danger' size='xs' onClick={handleBatchDelete}>
              <Lucide.Trash2 className='size-3' />
              Delete
            </Button>
          </div>
        </div>
      )}

      <TableContainer className='border-border rounded-lg border border-t-transparent'>
        <Table className='rounded-lg'>
          <TableHeader className='rounded-t'>
            <TableRow className='rounded-t'>
              <TableHead className='w-8 rounded-t'>
                <Checkbox
                  checked={
                    filteredFiles.length > 0 &&
                    selectedItems.size ===
                      [...folders.map((f) => f.id), ...files.map((f) => f.id)].length
                  }
                  onClick={handleSelectAll}
                />
              </TableHead>
              <TableHead className='w-96 rounded-t pl-0'>Name</TableHead>
              <TableHead className='w-32 rounded-t'>Type</TableHead>
              <TableHead className='w-32 rounded-t'>Size</TableHead>
              <TableHead className='w-40 rounded-t'>Last Modified</TableHead>
              <TableHead className='w-12 rounded-t'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isRefreshing ? (
              <>
                {Array.from({ length: 8 }).map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`}>
                    <TableCell>
                      <div className='bg-dimmed/10 size-4 animate-pulse rounded' />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <div className='bg-dimmed/10 size-4 animate-pulse rounded' />
                        <div className='bg-dimmed/10 h-4 w-32 animate-pulse rounded' />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='bg-dimmed/10 h-4 w-16 animate-pulse rounded' />
                    </TableCell>
                    <TableCell>
                      <div className='bg-dimmed/10 h-4 w-20 animate-pulse rounded' />
                    </TableCell>
                    <TableCell>
                      <div className='bg-dimmed/10 h-4 w-28 animate-pulse rounded' />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <>
                {folders.map((folder) => (
                  <TableRow
                    key={folder.id}
                    data-checked={selectedItems.has(folder.id)}
                    className='group cursor-pointer'
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = `/buckets/${bucketId}?prefix=${encodeURIComponent(folder.id)}`
                    }}
                  >
                    <TableCell className='text-center' onClick={(e) => e.stopPropagation()}>
                      <div className='relative flex size-4 items-center justify-center'>
                        <div
                          className={clx(
                            'absolute inset-0 flex items-center justify-center transition-opacity duration-150',
                            selectedItems.has(folder.id) || selectedItems.size > 0
                              ? 'opacity-0'
                              : 'opacity-100 group-hover:opacity-0'
                          )}
                        >
                          <IconBox variant='info' size='sm' className='p-0'>
                            <Lucide.Folder className='size-4' />
                          </IconBox>
                        </div>
                        <div
                          className={clx(
                            'absolute inset-0 transition-opacity duration-150',
                            selectedItems.has(folder.id) || selectedItems.size > 0
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          )}
                        >
                          <Checkbox
                            checked={selectedItems.has(folder.id)}
                            onClick={() => handleToggleSelect(folder.id)}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to='/buckets/$id'
                        params={{ id: bucketId }}
                        search={{ prefix: folder.id, key: undefined }}
                        onClick={(e) => e.stopPropagation()}
                        className='block max-w-96 truncate'
                      >
                        <Text className='text-sm font-medium'>{folder.name}</Text>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1.5'>
                        <Lucide.Folder className='text-dimmed size-3.5' />
                        <Text className='text-muted-foreground text-sm'>Folder</Text>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Text className='text-muted-foreground text-sm'>-</Text>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1.5'>
                        <Lucide.Calendar className='text-dimmed size-3.5' />
                        <Text className='text-muted-foreground text-sm'>
                          {formatDate(folder.modified)}
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Menu>
                        <MenuTrigger render={<Button variant='plain' />}>
                          <Lucide.MoreVertical className='size-4' />
                          <span className='sr-only'>Menu</span>
                        </MenuTrigger>
                        <MenuPopup className='w-32' align='end' size='compact'>
                          <MenuItem className='text-sm' onClick={() => handleCopyUrl(folder)}>
                            Copy URL
                          </MenuItem>
                          <MenuItem className='text-sm' onClick={() => handleRename(folder)}>
                            Rename
                          </MenuItem>
                          <MenuSeparator />
                          <MenuItem className='text-sm' onClick={() => handleDelete(folder)}>
                            Delete
                          </MenuItem>
                        </MenuPopup>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
                {files.map((file) => (
                  <TableRow
                    key={file.id}
                    data-checked={selectedItems.has(file.id)}
                    className='group'
                  >
                    <TableCell>
                      <div className='relative flex size-4 items-center justify-center'>
                        <div
                          className={clx(
                            'absolute inset-0 flex items-center justify-center transition-opacity duration-150',
                            selectedItems.has(file.id) || selectedItems.size > 0
                              ? 'opacity-0'
                              : 'opacity-100 group-hover:opacity-0'
                          )}
                        >
                          <IconBox variant='primary-subtle' size='sm' className='p-0'>
                            <Lucide.File className='size-4' />
                          </IconBox>
                        </div>
                        <div
                          className={clx(
                            'absolute inset-0 transition-opacity duration-150',
                            selectedItems.has(file.id) || selectedItems.size > 0
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          )}
                        >
                          <Checkbox
                            checked={selectedItems.has(file.id)}
                            onClick={() => handleToggleSelect(file.id)}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='pl-0'>
                      <Text className='max-w-96 truncate text-sm font-medium'>{file.name}</Text>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1.5'>
                        <Lucide.File className='text-dimmed size-3.5' />
                        <Text className='text-muted-foreground text-sm'>File</Text>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1.5'>
                        <Lucide.HardDrive className='text-dimmed size-3.5' />
                        <Text className='text-muted-foreground text-sm'>
                          {formatFileSize(file.size)}
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1.5'>
                        <Lucide.Calendar className='text-dimmed size-3.5' />
                        <Text className='text-muted-foreground text-sm'>
                          {formatDate(file.modified)}
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Menu>
                        <MenuTrigger render={<Button variant='plain' />}>
                          <Lucide.MoreVertical className='size-4' />
                          <span className='sr-only'>Menu</span>
                        </MenuTrigger>
                        <MenuPopup className='w-32' align='end' size='compact'>
                          <MenuItem className='text-sm' onClick={() => handleCopyUrl(file)}>
                            Copy URL
                          </MenuItem>
                          <MenuItem className='text-sm' onClick={() => handleDownload(file)}>
                            Download
                          </MenuItem>
                          <MenuItem className='text-sm' onClick={() => handleRename(file)}>
                            Rename
                          </MenuItem>
                          <MenuSeparator />
                          <MenuItem className='text-sm' onClick={() => handleDelete(file)}>
                            Delete
                          </MenuItem>
                        </MenuPopup>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredFiles.length === 0 && (
        <div className='border-border bg-dimmed/10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center'>
          {!hasAccessKeys ? (
            <>
              <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
                <Lucide.Lock className='size-16' />
              </IconBox>
              <div className='space-y-1'>
                <Text className='font-semibold'>No access keys assigned</Text>
                <Text className='text-muted-foreground text-sm'>
                  Assign access keys to this bucket to view and manage objects
                </Text>
              </div>
            </>
          ) : (
            <>
              <IconBox variant='tertiary-subtle' size='lg' circle className='mb-4'>
                <Lucide.FolderOpen className='size-16' />
              </IconBox>
              <div className='space-y-1'>
                <Text className='font-semibold'>No files or folders found</Text>
                <Text className='text-muted-foreground text-sm'>
                  {filterText
                    ? 'Try adjusting your search'
                    : 'Upload files or create folders to get started'}
                </Text>
              </div>
            </>
          )}
        </div>
      )}

      <React.Suspense
        fallback={
          <div className='animate-in fade-in flex items-center justify-center py-8'>
            <div className='flex flex-col items-center'>
              <Spinner className='size-6' />
              <Text className='text-muted-foreground mt-4 text-sm'>Loading folder...</Text>
            </div>
          </div>
        }
      >
        <CreateFolderDialog
          isOpen={showCreateFolderDialog}
          onClose={() => setShowCreateFolderDialog(false)}
          onCreate={handleCreateFolder}
          isSubmitting={isCreatingFolder}
        />
      </React.Suspense>

      <React.Suspense
        fallback={
          <div className='animate-in fade-in flex items-center justify-center py-8'>
            <div className='flex flex-col items-center'>
              <Spinner className='size-6' />
              <Text className='text-muted-foreground mt-4 text-sm'>Loading upload dialog...</Text>
            </div>
          </div>
        }
      >
        <UploadFileDialog
          isOpen={showUploadFileDialog}
          onClose={() => setShowUploadFileDialog(false)}
          onUpload={handleUploadFiles}
          isSubmitting={isUploadingFile}
        />
      </React.Suspense>
    </div>
  )
}
