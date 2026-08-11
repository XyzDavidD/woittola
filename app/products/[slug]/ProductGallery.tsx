"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useState } from "react";
import type { DeepTranslated, Messages } from "../../locales";
import { interpolate } from "../../locales";

type ProductGalleryProps = {
  productName: string;
  images: string[];
  ui: DeepTranslated<Messages>["product"];
};

export default function ProductGallery({ productName, images, ui }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryImages = images.filter(Boolean);

  const changeImage = (direction: number) => {
    if (!galleryImages.length) return;
    setActiveIndex((current) => (current + direction + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        {galleryImages.length ? <Image
          src={galleryImages[activeIndex]}
          alt={interpolate(ui.viewAlt, { product: productName, number: activeIndex + 1 })}
          fill
          priority
          sizes="(min-width: 1000px) 720px, 92vw"
          unoptimized
        /> : <span className="product-gallery-empty"><ImageOff aria-hidden="true" /> {ui.galleryEmpty}</span>}
        {galleryImages.length > 1 ? <button
          className="product-gallery-arrow product-gallery-arrow-left"
          type="button"
          aria-label={ui.previousImage}
          onClick={() => changeImage(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button> : null}
        {galleryImages.length > 1 ? <button
          className="product-gallery-arrow product-gallery-arrow-right"
          type="button"
          aria-label={ui.nextImage}
          onClick={() => changeImage(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button> : null}
      </div>

      {galleryImages.length > 1 ? <div className="product-gallery-thumbnails" aria-label={ui.galleryAria}>
        {galleryImages.map((image, index) => (
          <button
            className={index === activeIndex ? "active" : ""}
            type="button"
            aria-label={interpolate(ui.showImage, { number: index + 1 })}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            key={image}
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="130px"
              unoptimized
            />
          </button>
        ))}
      </div> : null}
    </div>
  );
}
