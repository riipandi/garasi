import { QueryClient, useMutation } from '@tanstack/react-query'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle
} from '~/app/components/dialog'
import { Field, FieldLabel } from '~/app/components/field'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Separator } from '~/app/components/separator'
import { Text } from '~/app/components/typography'
import clusterService from '~/app/services/cluster.service'

interface ConnectNodesDialogProps {
  isOpen: boolean
  onClose: () => void
  queryClient: QueryClient
}

export function ConnectNodesDialog({ isOpen, onClose, queryClient }: ConnectNodesDialogProps) {
  const [nodes, setNodes] = React.useState<string[]>([''])
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [nodeIds] = React.useState(() => Array.from({ length: 20 }, (_, i) => `node-${i}`))

  const connectMutation = useMutation({
    mutationFn: (nodeList: string[]) =>
      clusterService.connectClusterNodes({ nodes: nodeList.filter((n) => n.trim() !== '') }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster', 'health'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'statistics'] })
      onClose()
    },
    onError: (error) => {
      console.error('Failed to connect nodes:', error)
    }
  })

  const handleNodeChange = (index: number, value: string) => {
    const newNodes = [...nodes]
    newNodes[index] = value
    setNodes(newNodes)

    if (isValidNodeAddress(value)) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[value]
        return newErrors
      })
    }
  }

  const handleAddNode = () => {
    setNodes([...nodes, ''])
  }

  const handleRemoveNode = (index: number) => {
    if (nodes.length > 1) {
      const newNodes = nodes.filter((_, i) => i !== index)
      setNodes(newNodes)
      setErrors((prev) => {
        const newErrors = { ...prev }
        const nodeValue = nodes[index]
        if (nodeValue) {
          delete newErrors[nodeValue]
        }
        return newErrors
      })
    }
  }

  const isValidNodeAddress = (address: string): boolean => {
    if (!address.trim()) return false
    const regex = /^.+@.+$/i
    return regex.test(address.trim())
  }

  const validateAllNodes = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    nodes.forEach((node) => {
      if (node.trim() && !isValidNodeAddress(node)) {
        newErrors[node] = 'Invalid format. Expected: node_id@net_address'
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleConnect = () => {
    if (validateAllNodes()) {
      const validNodes = nodes.filter((n) => n.trim() !== '')
      if (validNodes.length > 0) {
        connectMutation.mutate(validNodes)
      }
    }
  }

  const handleClose = () => {
    if (!connectMutation.isPending) {
      setNodes([''])
      setErrors({})
      onClose()
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      setNodes([''])
      setErrors({})
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPopup className='w-xl'>
        <DialogHeader>
          <IconBox variant='primary' size='sm'>
            <Lucide.Network className='size-4' />
          </IconBox>
          <DialogTitle>Connect Cluster Nodes</DialogTitle>
          <DialogClose className='ml-auto'>
            <Lucide.XIcon className='size-4' strokeWidth={2.0} />
          </DialogClose>
        </DialogHeader>
        <DialogBody className='border-border mt-3 border-t pt-4'>
          <div className='border-primary/30 bg-primary/10 mb-4 rounded-lg border p-3'>
            <div className='flex items-start gap-2'>
              <Lucide.Info className='text-primary mt-1.5 size-4 shrink-0' />
              <Text className='text-sm leading-relaxed'>
                Enter node addresses in the format:{' '}
                <Badge variant='primary' size='sm' className='font-mono text-xs'>
                  node_id@net_address:port
                </Badge>
                <br />
                Example:{' '}
                <Badge variant='primary' size='sm' className='font-mono text-xs'>
                  abcdefghijklmnopqrstuvwxyz1234567890@192.168.1.10:3901
                </Badge>
              </Text>
            </div>
          </div>

          <div className='mt-4 space-y-3'>
            {nodes.map((node, index) => (
              <div key={nodeIds[index] || `node-input-${index}`} className='flex items-start gap-2'>
                <div className='flex-1'>
                  <Field>
                    <FieldLabel htmlFor={`node-${index}`} hidden>
                      Node Address
                    </FieldLabel>
                    <div className='inline-flex gap-3'>
                      <Input
                        id={`node-${index}`}
                        value={node}
                        onChange={(e) => handleNodeChange(index, e.target.value)}
                        placeholder='node_id@net_address'
                        className={errors[node] ? 'border-danger ring-danger' : ''}
                        disabled={connectMutation.isPending}
                      />
                      {nodes.length > 1 && (
                        <Button
                          variant='outline'
                          onClick={() => handleRemoveNode(index)}
                          disabled={connectMutation.isPending}
                        >
                          <Lucide.X className='size-4' />
                        </Button>
                      )}
                    </div>
                  </Field>
                  {errors[node] && <Text className='text-danger mt-1 text-xs'>{errors[node]}</Text>}
                </div>
              </div>
            ))}
          </div>
          <Separator className='my-6' />
          <Button
            variant='outline'
            block
            onClick={handleAddNode}
            disabled={connectMutation.isPending}
          >
            <Lucide.Plus className='size-4' />
            Add Another Node
          </Button>
        </DialogBody>
        <DialogFooter>
          <DialogClose block>Cancel</DialogClose>
          <Button
            type='button'
            variant='primary'
            onClick={handleConnect}
            disabled={connectMutation.isPending || nodes.every((n) => !n.trim())}
            block
          >
            {connectMutation.isPending ? (
              <span className='flex items-center gap-2'>
                <Lucide.Loader2 className='size-4 animate-spin' />
                Connecting...
              </span>
            ) : (
              'Connect Nodes'
            )}
          </Button>
        </DialogFooter>

        {connectMutation.data?.data && (
          <div className='mt-4 space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3'>
            <Text className='text-sm font-semibold'>Connection Results</Text>
            {connectMutation.data.data.map(
              (result: { success: boolean; error?: string | null }, index: number) => (
                <div
                  key={`connection-result-${result.success}-${index}`}
                  className='flex items-center gap-2 text-xs'
                >
                  {result.success ? (
                    <>
                      <Lucide.CheckCircle2 className='text-success size-3.5' />
                      <Text className='text-success'>Node connected successfully</Text>
                    </>
                  ) : (
                    <>
                      <Lucide.XCircle className='text-danger size-3.5' />
                      <Text className='text-danger'>{result.error || 'Connection failed'}</Text>
                    </>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </DialogPopup>
    </Dialog>
  )
}
