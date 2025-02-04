import { Fragment, useCallback } from "react";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Input,
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSection,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { prebuiltAppConfig } from "@mlc-ai/web-llm";
import {
  useLLMConfigStore,
  MODEL_FAMILIES,
  CacheType,
} from "../store/llmConfigStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CACHE_OPTIONS = [
  { value: CacheType.Cache, label: "Cache" },
  { value: CacheType.IndexedDB, label: "IndexedDB" },
];

export default function LLMSettingsDialog({ isOpen, onClose }: Props) {
  const { llmConfig, updateLLMConfig } = useLLMConfigStore();

  const getVramRequiredMB = useCallback((modelId: string): number => {
    const model = prebuiltAppConfig.model_list.find(
      (m) => m.model_id === modelId
    );
    return model?.vram_required_MB || 0;
  }, []);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  LLM Settings
                </DialogTitle>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <Menu>
                      <MenuButton className="w-full inline-flex items-center gap-2 rounded-md bg-white py-1.5 px-3 text-sm/6 font-semibold text-gray-800 shadow-md shadow-gray-200/50 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-gray-800">
                        {llmConfig.model}
                      </MenuButton>
                      <MenuItems
                        anchor="bottom start"
                        className="w-72 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-800 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                      >
                        {MODEL_FAMILIES.map((family) => (
                          <MenuSection key={family.family}>
                            <MenuHeading className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                              {family.family.toUpperCase()}
                            </MenuHeading>
                            {family.models.map((model) => {
                              const vramMB = getVramRequiredMB(model.name);
                              return (
                                <MenuItem key={model.name}>
                                  <Button
                                    onClick={() =>
                                      updateLLMConfig({ model: model.name })
                                    }
                                    className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 text-gray-800 hover:bg-gray-100 data-[focus]:bg-gray-200"
                                  >
                                    {model.name} ({model.provider}) -
                                    {vramMB
                                      ? `${(vramMB / 1024).toFixed(2)}GB`
                                      : "N/A"}
                                  </Button>
                                </MenuItem>
                              );
                            })}
                          </MenuSection>
                        ))}
                      </MenuItems>
                    </Menu>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cache Type
                    </label>
                    <Menu>
                      <MenuButton className="w-full inline-flex items-center gap-2 rounded-md bg-white py-1.5 px-3 text-sm/6 font-semibold text-gray-800 shadow-md shadow-gray-200/50 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-gray-800">
                        {llmConfig.cache}
                      </MenuButton>
                      <MenuItems
                        anchor="bottom start"
                        className="w-72 origin-top-right rounded-xl border border-gray-200 bg-white p-1 text-sm/6 text-gray-800 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                      >
                        {CACHE_OPTIONS.map((option) => (
                          <MenuItem key={option.value}>
                            <Button
                              onClick={() =>
                                updateLLMConfig({ cache: option.value })
                              }
                              className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 text-gray-800 hover:bg-gray-100 data-[focus]:bg-gray-200"
                            >
                              {option.label}
                            </Button>
                          </MenuItem>
                        ))}
                      </MenuItems>
                    </Menu>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Temperature ({llmConfig.temperature})
                    </label>
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={llmConfig.temperature}
                      onChange={(e) =>
                        updateLLMConfig({
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      className="mt-1 block w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Top P ({llmConfig.topP})
                    </label>
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={llmConfig.topP}
                      onChange={(e) =>
                        updateLLMConfig({
                          topP: parseFloat(e.target.value),
                        })
                      }
                      className="mt-1 block w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Length
                    </label>
                    <Input
                      type="number"
                      value={llmConfig.maxTokens}
                      onChange={(e) =>
                        updateLLMConfig({
                          maxTokens: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
