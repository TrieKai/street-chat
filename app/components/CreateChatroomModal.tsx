import { FormEvent } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export default function CreateChatroomModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    onSubmit(name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold text-black mb-4">
          Create New Chatroom
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter chatroom name"
            className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
