'use client';

import { CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
// import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { addItemToCart } from '@/lib/actions/cart.actions';

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);
    if (res.status !== 'success') {
      toast.error(res.message);
      return;
    } else {
      toast.success('', {
        description: `${item.name} added to cart`,
        action: {
          label: 'Go to cart',
          onClick: () => {
            router.push('/cart');
          },
        },
      });
    }
  };
  return (
    <Button className='w-full' type='button' onClick={handleAddToCart}>
      AddToCart
    </Button>
  );
};
export default AddToCart;
