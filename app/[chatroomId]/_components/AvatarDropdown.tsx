import { Fragment, useState } from "react";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import clsx from "clsx";
import { VenetianMask } from "lucide-react";
import HeadShot from "@/app/components/HeadShot";
import LoginDialog from "@/app/components/LoginDialog";
import { isAnonymousUser } from "@/helpers/user";

import type { User } from "@/types/chatroom";

const HEAD_SHOT_SIZE = 32;

interface Props {
  user: User | null;
  handleGoogleLogin: () => void;
  handleAnonymousLogin: () => void;
  handleLogout: () => void;
}

export default function AvatarDropdown({
  user,
  handleGoogleLogin,
  handleAnonymousLogin,
  handleLogout,
}: Props) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <Menu as="div" className="relative">
        <MenuButton className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <span className="sr-only">打開用戶選單</span>
          <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-700">
            {isAnonymousUser(user) ? (
              <VenetianMask />
            ) : (
              <HeadShot
                headShotURL={user?.photo_url || ""}
                width={HEAD_SHOT_SIZE}
                height={HEAD_SHOT_SIZE}
                title={user?.user_name}
              />
            )}
          </div>
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="px-1 py-1">
              <MenuItem>
                {({ focus }) =>
                  user ? (
                    <Button
                      className={clsx(
                        "group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900",
                        focus && "bg-gray-100"
                      )}
                      onClick={handleLogout}
                    >
                      登出
                    </Button>
                  ) : (
                    <Button
                      className={clsx(
                        "group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900",
                        focus && "bg-gray-100"
                      )}
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      登入
                    </Button>
                  )
                }
              </MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </Menu>

      <LoginDialog
        isLoginModalOpen={isLoginModalOpen}
        setIsLoginModalOpen={setIsLoginModalOpen}
        onGoogleLogin={handleGoogleLogin}
        onAnonymousLogin={handleAnonymousLogin}
      />
    </>
  );
}
