'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const ProductImages = ({ images }: { images: string[] }) => {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className='space-y-4'>
      <Image
        src={images[currentImage]}
        height={1000}
        width={1000}
        alt='product image'
        className='min-h-[300px] object-cover object-center'
      />
      <div className='flex'>
        {images.map((image, index) => (
          <div
            key={image}
            onClick={() => setCurrentImage(index)}
            className={cn(
              'border mr-2 cursor-pointer hover:border-orange-600 ',
              currentImage === index && 'border-orange-500',
            )}
          >
            <Image src={image} alt='image' height={100} width={100} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default ProductImages;
