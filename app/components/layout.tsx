import { Home, Settings, Upload } from 'lucide-react'
import { Logo } from './logo'
import { UserProfile } from './user-profile'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

import { UserProfileProps } from './user-profile'

interface LayoutProps {
  children: React.ReactNode
  userProfileData: UserProfileProps
}

export function Layout({ children, userProfileData }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className='flex min-h-screen'>
        <Sidebar className='w-64 flex-shrink-0'>
          <SidebarHeader className='border-b px-4 py-3'>
            <div className='flex items-center gap-2 px-2'>
              <Logo />
              <div className='flex flex-col'>
                <span className='font-semibold'>Release Dashboard</span>
                <Select defaultValue='futurelife'>
                  <SelectTrigger className='h-7 w-[130px] border-none bg-transparent p-0 text-sm text-muted-foreground hover:bg-transparent focus:ring-0 [&>span]:font-normal'>
                    <SelectValue placeholder='Select space' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='futurelife'>Futurelife</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className='p-4'>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='/'>
                    <Home className='h-4 w-4' />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='/releases'>
                    <Upload className='h-4 w-4' />
                    <span>Release</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href='/config'>
                    <Settings className='h-4 w-4' />
                    <span>Config</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </div>
      <div className='flex-1 flex flex-col min-w-0 container'>
        <header className='sticky top-0 z-10 flex h-14 items-center border-b bg-background'>
          <div className='flex w-full items-center justify-between px-4'>
            <div className='flex items-center gap-4'>
              <SidebarTrigger />
              <div className='w-[400px]'>
                <Input
                  type='search'
                  placeholder='Type Ctrl + Space for search and recent'
                  className='h-9'
                />
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <Button variant='outline' size='sm'>
                Help
              </Button>
              <UserProfile
                username={userProfileData.username}
                avatarUrl={userProfileData.avatarUrl}
              />
            </div>
          </div>
        </header>
        <main className='flex-1 overflow-auto'>
          <div className='mx-auto max-w-screen-xl px-4 py-6 container'>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
