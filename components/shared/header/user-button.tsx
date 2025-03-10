import Link from 'next/link';
import { auth } from '@/auth';
import { signOutUser } from '@/lib/actions/user.actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserIcon } from 'lucide-react';

const UserButton = async () => {
  const session = await auth();
  if (!session) {
    return (
      <Button asChild>
        <Link href='/sign-in'>
          <UserIcon /> Sign-In
        </Link>
      </Button>
    );
  }
  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? '';

  return (
    <div className='flex gap-2 items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              className='relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200'
            >
              <span className='text-lg font-medium'>{firstInitial}</span>
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <div className='text-sm font-medium leading-none'>
                {session.user?.name}
              </div>
              <div className='text-xs text-muted-foreground'>
                {session.user?.email}
              </div>
            </div>
          </DropdownMenuLabel>

          <div className='p-0 mb-1'>
            <form action={signOutUser} className='w-full'>
              <Button type='submit' className='w-full text-left'>
                Sign Out
              </Button>
            </form>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
