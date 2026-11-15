import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { Camera, MapPin, Plus } from "lucide-react";

import Modal from "@/components/seller/Modal";
import PageHeader from "@/components/seller/PageHeader";
import { useAuth } from "@/context/useAuth";
import { toAuthUser } from "@/lib/adapters";
import { api, ApiError } from "@/lib/api";

const fieldClass =
  "h-11 w-full rounded-lg border border-[#DDE3DC] bg-white px-3.5 text-[14px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5";

const secondaryButtonClass =
  "h-9 rounded-lg border border-[#DDE3DC] bg-white px-4 text-[12px] font-medium text-[#4A4A4A] transition hover:border-black hover:text-black";

const primaryButtonClass =
  "h-9 rounded-lg bg-black px-4 text-[12px] font-medium text-white transition hover:bg-[#292929] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  bio: string;
  location: string;
};

function formFromUser(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
}): ProfileForm {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
    phone: user.phone ?? "",
    username: user.username ?? "",
    bio: user.bio ?? "",
    location: user.location ?? "",
  };
}

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState<ProfileForm>(() =>
    user
      ? formFromUser(user)
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          username: "",
          bio: "",
          location: "",
        },
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [photoDraft, setPhotoDraft] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField =
    (field: keyof ProfileForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
      setSaved(false);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const updated = await api.profile.update({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        username: form.username,
        phone: form.phone,
        bio: form.bio,
        location: form.location,
      });

      setUser(toAuthUser(updated));
      setSaved(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? (caught.fieldError("email") ??
              caught.fieldError("username") ??
              caught.message)
          : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) setForm(formFromUser(user));
    setSaved(false);
    setError("");
  };

  const openPhotoModal = () => {
    setPhotoDraft(null);
    setPhotoPreview(null);
    setPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setPhotoDraft(null);
    setPhotoPreview(null);
    setPhotoModalOpen(false);
  };

  const loadPhoto = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;

    setPhotoDraft(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    loadPhoto(event.target.files?.[0]);
    event.target.value = "";
  };

  const handlePhotoDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    loadPhoto(event.dataTransfer.files?.[0]);
  };

  const handleSavePhoto = async () => {
    if (!photoDraft) {
      setPhotoModalOpen(false);
      return;
    }

    setPhotoSaving(true);

    try {
      const updated = await api.profile.update({ avatar: photoDraft });

      setUser(toAuthUser(updated));
      closePhotoModal();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not upload your photo.",
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="THE PERSON BEHIND THE GOOD FINDS"
        title="Profile"
        description="Make yourself at home. Keep your marketplace identity up to date."
      />

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-[#F3D3CE] bg-[#FDF2F1] px-4 py-3 text-[13px] text-[#B42318]"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">

        {/* Identity card */}
        <aside className="h-fit rounded-[10px] border border-[#E8ECE7] bg-white p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#E9F0E4] text-[24px] font-semibold text-black">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              user?.initials ?? "BS"
            )}
          </div>

          <p className="mt-4 text-[16px] font-semibold text-black">
            {form.firstName} {form.lastName}
          </p>

          <p className="mt-1 text-[13px] text-[#6B726B]">{form.email}</p>

          <button
            type="button"
            onClick={openPhotoModal}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md border border-[#DDE3DC] px-3 text-[13px] font-medium text-black transition hover:border-black"
          >
            <Camera size={12} aria-hidden="true" />
            Change photo
          </button>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-[#929792]">
            <MapPin size={10} aria-hidden="true" />
            {form.location || "Add your location"}
          </p>
        </aside>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Personal information */}
          <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-6">
            <h2 className="text-[15px] font-semibold text-black">
              Personal information
            </h2>
            <p className="mt-1 text-[13px] text-[#929792]">
              Your name and contact details for your BALIGYA account.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-[13px] font-medium text-black"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={updateField("firstName")}
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-[13px] font-medium text-black"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={updateField("lastName")}
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="mb-2 block text-[13px] font-medium text-black"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-[13px] font-medium text-black"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField("phone")}
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-[13px] font-medium text-black"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={updateField("username")}
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {/* Marketplace profile */}
          <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-6">
            <h2 className="text-[15px] font-semibold text-black">
              Marketplace profile
            </h2>

            <div className="mt-5">
              <label
                htmlFor="bio"
                className="mb-2 block text-[13px] font-medium text-black"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={updateField("bio")}
                rows={3}
                placeholder="Tell buyers a little about yourself"
                className="w-full resize-none rounded-lg border border-[#DDE3DC] bg-white px-3.5 py-3 text-[14px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="location"
                className="mb-2 block text-[13px] font-medium text-black"
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={updateField("location")}
                className={fieldClass}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {saved ? (
              <p className="mr-auto text-[13px] font-medium text-[#3F6B3F]">
                Changes saved.
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleCancel}
              className="h-10 rounded-lg border border-[#DDE3DC] bg-white px-4 text-[13px] font-medium text-[#4A4A4A] transition hover:border-black hover:text-black"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-lg bg-black px-4 text-[13px] font-medium text-white transition hover:bg-[#292929] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change profile photo */}
      <Modal
        open={photoModalOpen}
        onClose={closePhotoModal}
        title="Change profile photo"
        description="A friendly photo helps buyers get to know the person behind the good finds."
        footer={
          <>
            <button
              type="button"
              onClick={closePhotoModal}
              className={secondaryButtonClass}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSavePhoto()}
              disabled={photoSaving || !photoDraft}
              className={primaryButtonClass}
            >
              {photoSaving ? "Saving…" : "Save photo"}
            </button>
          </>
        }
      >
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#E9F0E4] text-[26px] font-semibold text-black">
            {photoPreview || user?.avatarUrl ? (
              <img
                src={photoPreview ?? user?.avatarUrl ?? ""}
                alt="Photo preview"
                className="h-full w-full object-cover"
              />
            ) : (
              user?.initials ?? "BS"
            )}
          </div>
        </div>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handlePhotoDrop}
          className="mt-5 rounded-lg border border-dashed border-[#D9DFD7] bg-[#F7F9F5] px-6 py-5 text-center"
        >
          <Plus size={18} className="mx-auto text-[#4A4A4A]" aria-hidden="true" />

          <p className="mt-2 text-[12px] text-[#6B726B]">
            Drag a photo here or choose a file
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 h-8 rounded-md border border-[#DDE3DC] bg-white px-3 text-[12px] font-medium text-black transition hover:border-black"
          >
            Upload / change photo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
          />
        </div>
      </Modal>
    </div>
  );
}
