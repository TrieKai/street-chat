import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useConfigStore, MODEL_FAMILIES, CacheType } from "../store/config";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CACHE_OPTIONS = [
  { value: CacheType.Cache, label: "Cache" },
  { value: CacheType.IndexedDB, label: "IndexedDB" },
];

export default function LLMSettingsDialog({ isOpen, onClose }: Props) {
  const { llmConfig, updateLLMConfig } = useConfigStore();

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
                    <select
                      value={llmConfig.model}
                      onChange={(e) =>
                        updateLLMConfig({ model: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      {MODEL_FAMILIES.map((family) => (
                        <optgroup
                          key={family.family}
                          label={family.family.toUpperCase()}
                        >
                          {family.models.map((model) => (
                            <option key={model.name} value={model.name}>
                              {model.name} ({model.provider})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cache Type
                    </label>
                    <select
                      value={llmConfig.cache}
                      onChange={(e) =>
                        updateLLMConfig({ cache: e.target.value as CacheType })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      {CACHE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Temperature ({llmConfig.temperature})
                    </label>
                    <input
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
                    <input
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
                    <input
                      type="number"
                      value={llmConfig.maxLength}
                      onChange={(e) =>
                        updateLLMConfig({
                          maxLength: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
