'use server';

import { CartItem } from '@/types';

export async function addItemToCart(data: CartItem) {
  return {
    status: 'success',
    message: 'Item added to cart successfully',
    data,
  };
}
