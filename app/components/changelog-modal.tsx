import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Badge } from '~/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import { ReleaseChangelog } from '~/services/gitlab.server'
import { Fragment } from 'react/jsx-runtime'

interface ChangelogModalProps {
  version: string
  changelog: ReleaseChangelog[]
  onOpenChange: (open: boolean) => void
}

export function ChangelogModal({
  version,
  changelog,
  onOpenChange,
}: ChangelogModalProps) {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            Changelog for version {version}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-[60vh] mt-4'>
          <div className='space-y-6 pr-6'>
            {changelog.map(entry => (
              <Fragment key={entry.projectName}>
                <div className='flex gap-4'>
                  <Badge variant='default' className='h-6'>
                    {entry.projectName}
                  </Badge>
                  <ReactMarkdown className='text-sm text-muted-foreground flex-1'>
                    {entry.description}
                  </ReactMarkdown>
                </div>
                <div className='flex gap-4'>
                  <Badge variant='outline' className='h-6'>
                    {entry.projectName} Links
                  </Badge>
                  <div className='text-sm text-muted-foreground flex-1'>
                    <a href={entry.releaseUrl} target='_blank' rel='noreferrer'>
                      details
                    </a>{' '}
                    -{' '}
                    <a
                      href={entry.closedMergeRequestsUrl}
                      target='_blank'
                      rel='noreferrer'
                    >
                      closed MRs
                    </a>{' '}
                    -{' '}
                    <a
                      href={entry.openedMergeRequestsUrl}
                      target='_blank'
                      rel='noreferrer'
                    >
                      opened MRs
                    </a>{' '}
                    -{' '}
                    <a href={entry.editUrl} target='_blank' rel='noreferrer'>
                      edit
                    </a>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
