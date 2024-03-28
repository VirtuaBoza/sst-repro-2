import Image from "next/image";
import React from "react";

const sizeMap = {
  large: {
    height: 480,
    width: 320,
  },
  medium: {
    height: 360,
    width: 240,
  },
  small: {
    height: 240,
    width: 160,
  },
  x_large: {
    height: 600,
    width: 400,
  },
  x_small: {
    height: 120,
    width: 80,
  },
};

export const CoverImage = React.forwardRef<
  React.ElementRef<typeof Image>,
  Omit<
    React.ComponentPropsWithoutRef<typeof Image>,
    "src" | "width" | "height"
  > & {
    alt: string;
    isbn_10: string | null | undefined;
    isbn_13: string | null | undefined;
    /**
     * x_small: 80x120
     * small: 160x240
     * medium: 240x360
     * large: 320x480
     * x_large: 400x600
     */
    size?: keyof typeof sizeMap;
  }
>(({ alt, isbn_10, isbn_13, size = "x_small", ...props }, ref) => {
  if (isbn_10 || isbn_13) {
    const queryValue = [isbn_10, isbn_13]
      .filter((val): val is string => Boolean(val))
      .join(",");
    return (
      <Image
        ref={ref}
        alt={alt}
        height={sizeMap[size || "x_small"].height}
        src={`https://titlepeek.follettsoftware.com/v2/images?isbns=${encodeURIComponent(
          queryValue
        )}&size=${size}&placeholder=true`}
        style={{
          height: sizeMap[size || "x_small"].height,
          objectFit: "contain",
          width: sizeMap[size || "x_small"].width,
        }}
        width={sizeMap[size || "x_small"].width}
        {...props}
      />
    );
  }
  return (
    <div
      ref={ref}
      className={props.className}
      style={{
        height: sizeMap[size || "x_small"].height,
        width: sizeMap[size || "x_small"].width,
      }}
    />
  );
});
CoverImage.displayName = "CoverImage";
