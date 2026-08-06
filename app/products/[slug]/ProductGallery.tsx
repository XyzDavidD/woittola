"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const galleryImages = Array.from({ length: 5 }, (_, index) => ({
  id: index,
  src: "/images/chair2.png",
}));

type ProductGalleryProps = {
  productName: string;
};

export default function ProductGallery({ productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const changeImage = (direction: number) => {
    setActiveIndex((current) => (current + direction + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <Image
          src={galleryImages[activeIndex].src}
          alt={`${productName} treatment chair view ${activeIndex + 1}`}
          fill
          priority
          sizes="(min-width: 1000px) 720px, 92vw"
          unoptimized
        />
        <button
          className="product-gallery-arrow product-gallery-arrow-left"
          type="button"
          aria-label="Previous product image"
          onClick={() => changeImage(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          className="product-gallery-arrow product-gallery-arrow-right"
          type="button"
          aria-label="Next product image"
          onClick={() => changeImage(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div className="product-gallery-thumbnails" aria-label="Product image gallery">
        {galleryImages.map((image, index) => (
          <button
            className={index === activeIndex ? "active" : ""}
            type="button"
            aria-label={`Show product image ${index + 1}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            key={image.id}
          >
            <Image
              src={image.src}
              alt=""
              fill
              sizes="130px"
              unoptimized
            />
          </button>
        ))}
      </div>
    </div>
  );
}
