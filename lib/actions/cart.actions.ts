'use server';

import { cookies } from 'next/headers';
import { CartItem } from '@/types';
import { formatErrors, convertToPlainObject, roundNumber } from '@/lib/utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';

// calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = roundNumber(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0),
  );
  const shippingPrice = roundNumber(itemsPrice > 100 ? 0 : 10);
  const taxPrice = roundNumber(itemsPrice * 0.15);
  const totalPrice = roundNumber(itemsPrice + shippingPrice + taxPrice);
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
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
    if (!product) throw new Error('Product not found!');

    if (!cart) {
      // create cart
      const newCart = insertCartSchema.parse({
        userId: userID,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });
      // add to db
      await prisma.cart.create({
        data: {
          ...newCart,
          totalPrice: calcPrice([item]).totalPrice,
        },
      });
      // revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        status: 'success',
        message: 'Item added to cart successfully',
      };
    } else {
      // update existing cart
      const updatedItems = [...cart.items, item];
      const prices = calcPrice(updatedItems);

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: updatedItems,
          ...prices,
        },
      });

      // revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        status: 'success',
        message: 'Item added to cart successfully',
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: 'error',
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
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}
