import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Settings, LogOut } from 'lucide-react'
import { Link } from '@remix-run/react'

export interface UserProfileProps {
  username: string
  avatarUrl: string
}

export function UserProfile({ username, avatarUrl }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 rounded-full p-0'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuItem className='flex flex-col items-start'>
          <div className='font-medium'>{username}</div>
          <div className='text-xs text-muted-foreground'>Logged in</div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to='/config' className='w-full flex items-center'>
            <Settings className='mr-2 h-4 w-4' />
            <span>Global Configuration</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to='/logout' className='w-full flex items-center'>
            <LogOut className='mr-2 h-4 w-4' />
            <span>Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
