import { Home, Settings, Upload } from 'lucide-react'
import { Logo } from './logo'
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

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className='flex min-h-screen'>
        <Sidebar>
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
          <SidebarContent>
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
        <div className='flex flex-1 flex-col'>
          <header className='sticky top-0 flex h-14 items-center justify-between border-b bg-background px-6'>
            <SidebarTrigger />
            <div className='flex items-center justify-center flex-1'>
              <Input
                type='search'
                placeholder='Type Ctrl + Space for search and recent'
                className='h-9 w-[400px] max-w-full'
              />
            </div>
            <Button variant='outline' size='sm'>
              Help
            </Button>
          </header>
          <main className='flex-1 overflow-auto'>
            <div className='mx-auto p-6'>{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
