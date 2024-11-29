import { useEffect, useState } from "react";
import NextImage from "next/image";
import { DEFAULT_AVATAR_PATH } from "@/constants/common";

interface IHeadShot {
  headShotURL: string;
  title?: string;
  alt?: string;
  width: number;
  height: number;
}

const checkImageLoadable = (path: string): Promise<string> =>
  new Promise((resolve) => {
    const image = new Image();
    image.src = path;
    image.onload = () => resolve(path);
    image.onerror = () => resolve(DEFAULT_AVATAR_PATH);
  });

const HeadShot = ({
  headShotURL,
  title,
  alt = "avatar",
  width,
  height,
}: IHeadShot): JSX.Element => {
  const [imageURL, setImageURL] = useState<string>(DEFAULT_AVATAR_PATH);

  useEffect(() => {
    const getImageURL = async () => {
      const imageURL = await checkImageLoadable(headShotURL);
      setImageURL(imageURL);
    };
    getImageURL();
  }, [headShotURL]);

  return (
    <NextImage
      src={imageURL}
      title={title}
      width={width}
      height={height}
      alt={alt}
      className="rounded-full"
    />
  );
};

export default HeadShot;
