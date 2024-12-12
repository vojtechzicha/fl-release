import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Badge } from '~/components/ui/badge'
import ReactMarkdown from 'react-markdown'

interface ChangelogModalProps {
  version: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ChangelogEntry {
  type: 'feature' | 'fix' | 'improvement'
  description: string // This will now contain Markdown content
}

const getChangelog = (version: string): ChangelogEntry[] => {
  // Placeholder data - replace with actual changelog data
  return [
    {
      type: 'feature',
      description:
        'Added new **dashboard analytics**:\n* Real-time user tracking\n* Customizable widgets',
    },
    {
      type: 'fix',
      description:
        'Fixed user authentication issue:\n1. Resolved token expiration bug\n2. Improved error handling',
    },
    {
      type: 'improvement',
      description:
        'Improved loading performance:\n- Implemented lazy loading for images\n- Optimized database queries',
    },
  ]
}

export function ChangelogModal({
  version,
  open,
  onOpenChange,
}: ChangelogModalProps) {
  const changelog = getChangelog(version)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            Changelog for version {version}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-[60vh] mt-4'>
          <div className='space-y-6 pr-6'>
            {changelog.map((entry, index) => (
              <div key={index} className='flex gap-4'>
                <Badge
                  variant={
                    entry.type === 'feature'
                      ? 'default'
                      : entry.type === 'fix'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className='h-6'
                >
                  {entry.type}
                </Badge>
                <ReactMarkdown className='text-sm text-muted-foreground flex-1'>
                  {entry.description}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
