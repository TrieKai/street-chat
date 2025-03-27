import { useCallback, useEffect, useState } from "react";
import NextImage from "next/image";
import {
  DEFAULT_ASSISTANT_AVATAR_PATH,
  DEFAULT_USER_AVATAR_PATH,
} from "@/constants/common";

interface IHeadShot {
  headShotURL: string;
  type?: "user" | "assistant";
  title?: string;
  alt?: string;
  width: number;
  height: number;
}

const HeadShot = ({
  headShotURL,
  type = "user",
  title,
  alt = "avatar",
  width,
  height,
}: IHeadShot): JSX.Element => {
  const DEFAULT_AVATAR_PATH =
    type === "user" ? DEFAULT_USER_AVATAR_PATH : DEFAULT_ASSISTANT_AVATAR_PATH;
  const [imageURL, setImageURL] = useState<string>(DEFAULT_AVATAR_PATH);

  const checkImageLoadable = useCallback(
    (path: string): Promise<string> =>
      new Promise((resolve) => {
        const image = new Image();
        image.src = path;
        image.onload = () => resolve(path);
        image.onerror = () => resolve(DEFAULT_AVATAR_PATH);
      }),
    [DEFAULT_AVATAR_PATH]
  );

  useEffect(() => {
    const getImageURL = async (): Promise<void> => {
      const imageURL = await checkImageLoadable(headShotURL);
      setImageURL(imageURL);
    };

    void getImageURL();
  }, [checkImageLoadable, headShotURL]);

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
