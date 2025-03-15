'use server';

import { cookies } from 'next/headers';
import { CartItem } from '@/types';
import { formatErrors } from '@/lib/utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema } from '../validators';

export async function addItemToCart(data: CartItem) {
  // check for cart cookie
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if (!sessionCartId) throw new Error('Cart Session not found!');

  // get the session and userID
  const session = await auth();
  const userID = session?.user?.id ? (session.user.id as string) : undefined;

  // get cart
  const cart = await getMyCart();

  // parse and validate item
  const item = cartItemSchema.parse(data);

  // find product in db
  const product = await prisma.product.findFirst({
    where: {
      id: item.productId,
    },
  });

  // test
  console.log('sessionCartId', sessionCartId);
  console.log('userID', userID);
  console.log('item', item);
  console.log('product', product);
  try {
    return {
      success: true,
      message: 'Item added to cart successfully',
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if (!sessionCartId) throw new Error('Cart Session not found!');

  // get the session and userID
  const session = await auth();
  const userID = session?.user?.id ? (session.user.id as string) : undefined;

  //get user cart from db
  const cart = await prisma.cart.findFirst({
    where: userID ? { userId: userID } : { sessionCartId: sessionCartId },
  });
  if (!cart) return undefined;

  // convert decimals and return
  return convertToCartItems({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}
